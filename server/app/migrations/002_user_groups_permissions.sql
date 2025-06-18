CREATE TABLE auth_user (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL,
    is_superuser BOOLEAN NOT NULL
);

CREATE TABLE auth_group (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE auth_permission (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    codename VARCHAR(255) NOT NULL,
    UNIQUE (model_name, codename)
);

CREATE TABLE auth_group_permissions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    group_id INT NOT NULL,
    permission_id INT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES auth_group(id),
    FOREIGN KEY (permission_id) REFERENCES auth_permission(id),
    UNIQUE (group_id, permission_id)
);

CREATE TABLE auth_user_groups (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_user(id),
    FOREIGN KEY (group_id) REFERENCES auth_group(id),
    UNIQUE (user_id, group_id)
);