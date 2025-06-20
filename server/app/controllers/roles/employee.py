from ...dal.repositories.auth import UserRepository
from ...dal.repositories.employee import EmployeeRepository
from ...dal.schemas import Employee, User
from ...dal.schemas.auth import UserUpdate
from .cashier import UserCashierPermissionController
from .manager import UserManagerPermissionController


class UserEmployeePermissionController:
    def __init__(
        self,
        cashier_controller: UserCashierPermissionController,
        manager_controller: UserManagerPermissionController,
        user_repo: UserRepository,
        employee_repo: EmployeeRepository,
    ):
        self.cashier_controller = cashier_controller
        self.manager_controller = manager_controller
        self.user_repo = user_repo
        self.employee_repo = employee_repo

    def assign_employee(self, user: User, employee: Employee) -> None:
        self.cashier_controller.remove_from_user(user)
        self.manager_controller.remove_from_user(user)

        self.user_repo.update(user.id, UserUpdate(id_employee=employee.id_employee))

        if employee.empl_role == "cashier":
            self.cashier_controller.assign_to_user(user)
        elif employee.empl_role == "manager":
            self.manager_controller.assign_to_user(user)
        else:
            raise ValueError(f"Invalid employee role: {employee.empl_role}")

    def remove_employee(self, user: User) -> None:
        self.cashier_controller.remove_from_user(user)
        self.manager_controller.remove_from_user(user)

        self.user_repo.update(user.id, UserUpdate(id_employee=None))
