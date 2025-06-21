from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Security
from fastapi_utils.cbv import cbv
from pydantic import BaseModel

from ..controllers.employee import (
    EmployeeModificationController,
    EmployeeQueryController,
)
from ..dal.repositories.employee import EmployeeRepository
from ..dal.schemas.auth import User
from ..dal.schemas.employee import CreateEmployee, Employee, UpdateEmployee
from ..db.connection.exceptions import IntegrityError
from ..ioc_container import (
    employee_modification_controller,
    employee_query_controller,
    employee_repository,
)
from .auth import BasicPermission, require_permission, require_user

router = APIRouter(
    prefix="/employees",
    tags=["employees"],
    dependencies=[Depends(require_user)],
)


class PaginatedEmployees(BaseModel):
    data: list[Employee]
    total: int
    page: int
    page_size: int
    total_pages: int


class BulkDeleteRequest(BaseModel):
    employee_ids: list[str]


@cbv(router)
class EmployeeViewSet:
    repo: EmployeeRepository = Depends(employee_repository)
    query_controller: EmployeeQueryController = Depends(employee_query_controller)
    modification_controller: EmployeeModificationController = Depends(
        employee_modification_controller
    )

    @router.get("/", response_model=PaginatedEmployees, operation_id="getEmployees")
    async def get_employees(
        self,
        skip: int = Query(0, ge=0),
        limit: int = Query(10, ge=1, le=1000),
        search: Optional[str] = Query(None, description="Search by surname"),
        role_filter: Optional[str] = Query(None, description="Filter by role"),
        sort_by: Literal[
            "empl_surname",
            "empl_role",
            "id_employee",
            "salary",
            "date_of_birth",
            "date_of_start",
        ] = Query("empl_surname"),
        sort_order: Literal["asc", "desc"] = Query("asc"),
        _: User = Security(require_permission((Employee, BasicPermission.VIEW))),
    ):
        employees = self.repo.get_all(
            skip=skip,
            limit=limit,
            search=search,
            role_filter=role_filter,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        total = len(employees)
        total_pages = (total + limit - 1) // limit

        return PaginatedEmployees(
            data=employees,
            total=total,
            page=(skip // limit) + 1,
            page_size=limit,
            total_pages=total_pages,
        )

    @router.get(
        "/reports/only-with-promotional-sales",
        response_model=list[Employee],
        operation_id="getEmployeesOnlyWithPromotionalSales",
    )
    async def get_employees_only_with_promotional_sales(
        self,
        _: User = Security(require_permission((Employee, BasicPermission.VIEW))),
    ):
        return self.query_controller.only_with_promotional_sales()

    @router.get("/{id_employee}", response_model=Employee, operation_id="getEmployee")
    async def get_employee(
        self,
        id_employee: str,
        _: User = Security(require_permission((Employee, BasicPermission.VIEW))),
    ):
        employee = self.repo.get_by_id(id_employee)
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee

    @router.post("/", response_model=Employee, operation_id="createEmployee")
    async def create_employee(
        self,
        request: CreateEmployee,
        _: User = Security(require_permission((Employee, BasicPermission.CREATE))),
    ):
        return self.modification_controller.create_employee(request)

    @router.put(
        "/{id_employee}", response_model=Employee, operation_id="updateEmployee"
    )
    async def update_employee(
        self,
        id_employee: str,
        request: UpdateEmployee,
        _: User = Security(require_permission((Employee, BasicPermission.UPDATE))),
    ):
        employee = self.modification_controller.update_employee(id_employee, request)
        return employee

    @router.delete("/{id_employee}", operation_id="deleteEmployee")
    async def delete_employee(
        self,
        id_employee: str,
        _: User = Security(require_permission((Employee, BasicPermission.DELETE))),
    ):
        try:
            self.modification_controller.delete_employee(id_employee)
        except IntegrityError as e:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete employee because it is associated with checks",
            ) from e

    @router.post("/bulk-delete", operation_id="bulkDeleteEmployees")
    async def bulk_delete_employees(
        self,
        request: BulkDeleteRequest,
        _: User = Security(require_permission((Employee, BasicPermission.DELETE))),
    ):
        try:
            return self.modification_controller.bulk_delete(request.employee_ids)
        except IntegrityError as e:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete employee because it is associated with checks",
            ) from e
