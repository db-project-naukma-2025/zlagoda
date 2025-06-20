ALTER TABLE
    auth_user
ADD
    COLUMN id_employee VARCHAR(10) DEFAULT NULL;

ALTER TABLE
    auth_user
ADD
    CONSTRAINT fk_auth_user_employee FOREIGN KEY (id_employee) REFERENCES employee(id_employee) ON UPDATE CASCADE ON DELETE NO ACTION;