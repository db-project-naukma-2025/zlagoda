from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi_utils.cbv import cbv
from pydantic import BaseModel

from ..controllers.auth.exceptions import AuthenticationError
from ..controllers.auth.login import LoginController
from ..dal.schemas.auth import User
from ..ioc_container import login_controller

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


class Token(BaseModel):
    access_token: str
    token_type: str


@cbv(router)
class AuthViewSet:
    login_controller: LoginController = Depends(login_controller)

    @router.post("/token")
    async def login(
        self,
        form_data: OAuth2PasswordRequestForm = Depends(),
    ):
        username, password = form_data.username, form_data.password

        response = self.login_controller.login(username, password)
        return Token(access_token=response.access_token, token_type="bearer")

    @router.get("/me")
    async def me(self, user: User = Depends(require_user)):
        return user
