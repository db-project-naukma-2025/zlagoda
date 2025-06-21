from ..dal.repositories.employee import EmployeeRepository
from ..dal.schemas.employee import CreateEmployee, Employee, UpdateEmployee
from .roles.employee import UserEmployeePermissionController


class EmployeeQueryController:
    def __init__(self, repo: EmployeeRepository):
        self.repo = repo

    def only_with_promotional_sales(self) -> list[Employee]:
        return self.repo.get_employees_only_with_promotional_sales()


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
