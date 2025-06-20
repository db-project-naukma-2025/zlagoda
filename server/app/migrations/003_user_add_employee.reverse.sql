ALTER TABLE
    auth_user DROP CONSTRAINT IF EXISTS fk_auth_user_employee;

ALTER TABLE
    auth_user DROP COLUMN IF EXISTS id_employee;