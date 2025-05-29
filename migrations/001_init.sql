CREATE TABLE category (
    category_number INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL
);

CREATE TABLE product (
    id_product INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_number INT REFERENCES category(category_number)
    ON UPDATE CASCADE 
    ON DELETE NO ACTION,
    product_name VARCHAR(50) NOT NULL,
    characteristics VARCHAR(100) NOT NULL
);

CREATE TABLE store_product (
    UPC VARCHAR(12) PRIMARY KEY,
    UPC_prom VARCHAR(12),
    id_product INT NOT NULL,
    selling_price DECIMAL(13,4) NOT NULL,
    products_number INT NOT NULL,
    promotional_product BOOLEAN NOT NULL,

    FOREIGN KEY (UPC_prom)
        REFERENCES store_product(UPC)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (id_product)
        REFERENCES product(id_product)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);

CREATE TABLE employee (
    id_employee VARCHAR(10) PRIMARY KEY,
    empl_surname VARCHAR(50) NOT NULL,
    empl_name VARCHAR(50) NOT NULL,
    empl_patronymic VARCHAR(50),
    empl_role VARCHAR(10) NOT NULL,
    salary DECIMAL(13, 4) NOT NULL,
    date_of_birth DATE NOT NULL,
    ate_of_start DATE NOT NULL,
    phone_number VARCHAR(13) NOT NULL,
    city VARCHAR(50) NOT NULL,
    street VARCHAR(50) NOT NULL,
    zip_code VARCHAR(9) NOT NULL
);

CREATE TABLE customer_card (
    card_number VARCHAR(13) PRIMARY KEY,
    cust_surname VARCHAR(50) NOT NULL,
    cust_name VARCHAR(50) NOT NULL,
    cust_patronymic VARCHAR(50),
    phone_number VARCHAR(13) NOT NULL,
    city VARCHAR(50),
    street VARCHAR(50),
    zip_code VARCHAR(9),
    percent INT NOT NULL
);

CREATE TABLE "check" (
    check_number VARCHAR(10) PRIMARY KEY,
    id_employee VARCHAR(10) NOT NULL,
    card_number VARCHAR(13),
    print_date TIMESTAMP NOT NULL,
    sum_total DECIMAL(13,4) NOT NULL,
    vat DECIMAL(13,4) NOT NULL,

    FOREIGN KEY (id_employee)
        REFERENCES employee(id_employee)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    FOREIGN KEY (card_number)
        REFERENCES customer_card(card_number)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);

CREATE TABLE sale (
    UPC VARCHAR(12) NOT NULL,
    check_number VARCHAR(10) NOT NULL,
    product_number INT NOT NULL,
    selling_price DECIMAL(13,4) NOT NULL,
    PRIMARY KEY (UPC, check_number),
    FOREIGN KEY (UPC)
        REFERENCES store_product(UPC)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    FOREIGN KEY (check_number)
        REFERENCES "check"(check_number)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);