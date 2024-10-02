USE warehouse;

-- Employee table
CREATE TABLE EMPLOYEE (
    EMPLOYEE_ID INT AUTO_INCREMENT NOT NULL,
    NAME VARCHAR(100) NOT NULL,
    CPF VARCHAR(11) NOT NULL,
    HIRE_DATE DATE NOT NULL,
    TERMINATION_DATE DATE,
    PRIMARY KEY (EMPLOYEE_ID)
);

-- Product table
CREATE TABLE PRODUCT (
    PRODUCT_ID INT AUTO_INCREMENT NOT NULL,
    NAME VARCHAR(100) NOT NULL,
    CODE VARCHAR(11) NOT NULL,
    CREATION_DATE DATETIME NOT NULL,
    MODIFICATION_DATE DATE,
    FINALIZED_DATE DATE,
    PRIMARY KEY (PRODUCT_ID)
);

-- Supplier table
CREATE TABLE SUPPLIER (
    SUPPLIER_ID INT AUTO_INCREMENT NOT NULL,
    NAME VARCHAR(100) NOT NULL,
    CNPJ VARCHAR(14) NOT NULL,
    CONTRACT_START_DATE DATE NOT NULL,
    CONTRACT_END_DATE DATE,
    PRIMARY KEY (SUPPLIER_ID)
);

-- Product-Supplier relation table
CREATE TABLE PRODUCT_SUPPLIER (
    PRODUCT_SUPPLIER_ID INT AUTO_INCREMENT NOT NULL,
    SUPPLIER_ID INT NOT NULL, 
    PRODUCT_ID INT NOT NULL,
    QUANTITY BIGINT NOT NULL,
    COST FLOAT NOT NULL,
    FOREIGN KEY (SUPPLIER_ID) REFERENCES SUPPLIER(SUPPLIER_ID),
    FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(PRODUCT_ID),
    PRIMARY KEY (PRODUCT_SUPPLIER_ID)
);

-- Receipt table
CREATE TABLE RECEIPT (
    RECEIPT_ID INT AUTO_INCREMENT NOT NULL,
    PRODUCT_SUPPLIER_ID INT NOT NULL,
    QUANTITY INT NOT NULL,
    UNIT_COST FLOAT NOT NULL,
    RECEIPT_DATE DATETIME NOT NULL,
    FOREIGN KEY (PRODUCT_SUPPLIER_ID) REFERENCES PRODUCT_SUPPLIER(PRODUCT_SUPPLIER_ID),
    PRIMARY KEY (RECEIPT_ID)
);

-- Movement table
CREATE TABLE MOVEMENT (
    MOVEMENT_ID INT AUTO_INCREMENT NOT NULL,
    PRODUCT_ID INT NOT NULL,
    EMPLOYEE_ID INT NOT NULL,
    QUANTITY INT NOT NULL,
    UNIT_COST FLOAT NOT NULL,
    MOVEMENT_TYPE ENUM('ENTRY', 'EXIT') NOT NULL,
    MOVEMENT_DATE DATETIME NOT NULL,
    FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(PRODUCT_ID),
    FOREIGN KEY (EMPLOYEE_ID) REFERENCES EMPLOYEE(EMPLOYEE_ID),
    PRIMARY KEY (MOVEMENT_ID)
);
