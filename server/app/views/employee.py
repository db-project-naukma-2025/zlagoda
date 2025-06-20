from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi_utils.cbv import cbv
from pydantic import BaseModel

from ..dal.repositories.employee import EmployeeRepository
from ..dal.schemas.employee import CreateEmployee, Employee, UpdateEmployee
from ..ioc_container import employee_repository

router = APIRouter(prefix="/employees", tags=["employees"])


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

    @router.get("/", response_model=PaginatedEmployees, operation_id="getEmployees")
    async def get_employees(
        self,
        skip: int = Query(0, ge=0),
        limit: int = Query(10, ge=1, le=1000),
        search: Optional[str] = Query(None, description="Search by surname"),
        role_filter: Optional[str] = Query(None, description="Filter by role"),
        sort_by: Literal["empl_surname", "empl_role"] = Query("empl_surname"),
        sort_order: Literal["asc", "desc"] = Query("asc"),
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

    @router.get("/{id_employee}", response_model=Employee, operation_id="getEmployee")
    async def get_employee(self, id_employee: str):
        employee = self.repo.get_by_id(id_employee)
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee

    @router.post("/", response_model=Employee, operation_id="createEmployee")
    async def create_employee(self, request: CreateEmployee):
        return self.repo.create(request)

    @router.put(
        "/{id_employee}", response_model=Employee, operation_id="updateEmployee"
    )
    async def update_employee(self, id_employee: str, request: UpdateEmployee):
        return self.repo.update(id_employee, request)

    @router.delete("/{id_employee}", operation_id="deleteEmployee")
    async def delete_employee(self, id_employee: str):
        self.repo.delete(id_employee)

    @router.post("/bulk-delete", operation_id="bulkDeleteEmployees")
    async def bulk_delete_employees(self, request: BulkDeleteRequest):
        return self.repo.delete_multiple(request.employee_ids)
