from typing import Callable, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi_utils.cbv import cbv
from pydantic import BaseModel

from ..controllers.auth.exceptions import AuthenticationError
from ..controllers.auth.login import LoginController
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


PermissionCheck = Callable[[tuple[type, str] | tuple[type, BasicPermission]], User]


async def require_permission(
    current_user: User = Depends(require_user),
    user_permission_controller: UserPermissionController = Depends(
        user_permission_controller
    ),
) -> PermissionCheck:
    def permission_check(permission: tuple[type, str] | tuple[type, BasicPermission]):
        model, perm = permission

        if not (
            current_user.is_superuser
            or user_permission_controller.has_model_permission(
                current_user, model, perm
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to perform this action",
            )
        return current_user

    return permission_check


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"]


@cbv(router)
class AuthViewSet:
    login_controller: LoginController = Depends(login_controller)

    @router.post("/token", response_model=TokenResponse, operation_id="login")
    async def login(
        self,
        form_data: OAuth2PasswordRequestForm = Depends(),
    ) -> TokenResponse:
        username, password = form_data.username, form_data.password

        response = self.login_controller.login(username, password)
        return TokenResponse(access_token=response.access_token, token_type="bearer")

    @router.get("/me", response_model=User, operation_id="me")
    async def me(self, user: User = Depends(require_user)) -> User:
        return user
