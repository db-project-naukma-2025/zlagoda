from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi_utils.cbv import cbv
from pydantic import BaseModel

from ..controllers.auth.exceptions import AuthenticationError
from ..controllers.auth.login import InvalidCredentialsError, LoginController
from ..controllers.permissions.user import (
    BasicPermission,
    UserPermissionController,
)
from ..dal.schemas.auth import User
from ..ioc_container import login_controller, user_permission_controller

router = APIRouter(prefix="/auth", tags=["auth"])


oauth2_scheme = OAuth2PasswordBearer(tokenUrl=router.prefix + "/token", auto_error=True)


async def require_user(
    controller: LoginController = Depends(login_controller),
    token: str = Depends(oauth2_scheme),
) -> User:
    try:
        user = controller.get_user(token)
    except AuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def require_permission(permission: tuple[type, str] | tuple[type, BasicPermission]):
    model, perm = permission

    async def permission_check(
        current_user: User = Depends(require_user),
        user_permission_controller: UserPermissionController = Depends(
            user_permission_controller
        ),
    ) -> User:
        if not user_permission_controller.has_model_permission(
            current_user, model, perm
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to perform this action",
            )
        return current_user

    return permission_check


class ErrorResponse(BaseModel):
    detail: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"]


@cbv(router)
class AuthViewSet:
    login_controller: LoginController = Depends(login_controller)

    @router.post(
        "/token",
        response_model=TokenResponse,
        operation_id="login",
        responses={
            401: {"model": ErrorResponse, "description": "Invalid credentials"},
        },
    )
    async def login(
        self,
        form_data: OAuth2PasswordRequestForm = Depends(),
    ) -> TokenResponse:
        username, password = form_data.username, form_data.password

        try:
            response = self.login_controller.login(username, password)
        except InvalidCredentialsError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return TokenResponse(access_token=response.access_token, token_type="bearer")

    @router.get("/me", response_model=User, operation_id="me")
    async def me(self, user: User = Depends(require_user)) -> User:
        return user

    @router.get("/me/scopes", response_model=list[str], operation_id="meScopes")
    async def me_scopes(
        self,
        user: User = Depends(require_user),
        perm_controller: UserPermissionController = Depends(user_permission_controller),
    ) -> list[str]:
        permissions = list(perm_controller.get_all_permissions(user))
        return [perm.codename for perm in permissions]
