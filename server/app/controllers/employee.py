from datetime import date

from ..dal.repositories.employee import EmployeeRepository
from ..dal.schemas.employee import (
    CreateEmployee,
    Employee,
    EmployeeSelfInfo,
    UpdateEmployee,
)
from .roles.employee import UserEmployeePermissionController


class EmployeeQueryController:
    def __init__(self, repo: EmployeeRepository):
        self.repo = repo

    def only_with_promotional_sales(self) -> list[Employee]:
        return self.repo.get_employees_only_with_promotional_sales()

    def get_employee_self_info(self, id_employee: str) -> EmployeeSelfInfo:
        employee = self.repo.get_by_id(id_employee)
        if not employee:
            raise ValueError(f"Employee with id '{id_employee}' not found")

        statistics = self.repo.get_employee_statistics(id_employee)

        today = date.today()
        age = today.year - employee.date_of_birth.year
        if today.month < employee.date_of_birth.month or (
            today.month == employee.date_of_birth.month
            and today.day < employee.date_of_birth.day
        ):
            age -= 1

        work_experience_days = (today - employee.date_of_start).days

        return EmployeeSelfInfo(
            employee=employee,
            statistics=statistics,
            work_experience_days=work_experience_days,
            age=age,
        )


class EmployeeModificationController:
    def __init__(
        self,
        repo: EmployeeRepository,
        perm_controller: UserEmployeePermissionController,
    ):
        self.repo = repo
        self.perm_controller = perm_controller

    def create_employee(self, employee: CreateEmployee) -> Employee:
        return self.repo.create(employee)

    def update_employee(self, id_employee: str, request: UpdateEmployee) -> Employee:
        employee = self.repo.update(id_employee, request)
        self.perm_controller.update_related_roles(employee)
        return employee

    def delete_employee(self, id_employee: str) -> None:
        return self.repo.delete(id_employee)

    def bulk_delete(self, id_employees: list[str]) -> None:
        return self.repo.delete_multiple(id_employees)
