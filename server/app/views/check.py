from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query, Security
from fastapi_utils.cbv import cbv
from pydantic import BaseModel

from ..controllers.check import CheckModificationController, CheckQueryController
from ..dal.schemas.auth import User
from ..dal.schemas.check import Check, CreateCheck, RelationalCheck
from ..ioc_container import check_modification_controller, check_query_controller
from .auth import BasicPermission, require_permission, require_user

router = APIRouter(
    prefix="/checks",
    tags=["checks"],
    dependencies=[Depends(require_user)],
)


class PaginatedChecks(BaseModel):
    data: list[Check]
    total: int
    page: int
    page_size: int


@cbv(router)
class CheckViewSet:
    query_controller: CheckQueryController = Depends(check_query_controller)
    modification_controller: CheckModificationController = Depends(
        check_modification_controller
    )

    @router.post("/", response_model=Check, summary="Create new check with sales")
    async def create_check(
        self,
        check_data: CreateCheck,
        _: User = Security(
            require_permission((RelationalCheck, BasicPermission.CREATE))
        ),
    ) -> Check:
        return self.modification_controller.create(check_data)

    @router.get("/{check_number}", response_model=Check)
    async def get_check(
        self,
        check_number: str,
        _: User = Security(require_permission((RelationalCheck, BasicPermission.VIEW))),
    ) -> Check:
        return self.query_controller.get_check(check_number)

    @router.get(
        "/", response_model=PaginatedChecks, summary="Get all checks with filters"
    )
    async def get_checks(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: Optional[int] = Query(
            None, ge=1, le=1000, description="Maximum number of records to return"
        ),
        date_from: Optional[date] = Query(None, description="Filter by date from"),
        date_to: Optional[date] = Query(None, description="Filter by date to"),
        employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
        _: User = Security(require_permission((RelationalCheck, BasicPermission.VIEW))),
    ) -> PaginatedChecks:
        checks = self.query_controller.get_all(
            skip=skip,
            limit=limit,
            date_from=date_from,
            date_to=date_to,
            employee_id=employee_id,
        )

        actual_limit = limit or 10
        return PaginatedChecks(
            data=checks,
            total=len(checks),
            page=(skip // actual_limit) + 1,
            page_size=actual_limit,
        )
