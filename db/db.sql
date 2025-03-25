CREATE TABLE full_address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    postal_code VARCHAR(6) UNIQUE,
    country VARCHAR(10),
    province VARCHAR(20),
    city VARCHAR(20),
    street_address VARCHAR(40)
);

CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(30),
    no_in_stock INT
);


CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone_number VARCHAR(15),
    email_address VARCHAR(100),
    user_type VARCHAR(2),
    address_id INT,
    FOREIGN KEY (address_id) REFERENCES full_address(address_id),
    password VARCHAR(255)
);

CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    card_ref_number INT,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    role VARCHAR(10),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    employee_id INT NULL,
    order_date DATE,
    total FLOAT,
    status varchar(20),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE menu_item (
    menu_item_id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT,
    menu_item_name VARCHAR(40),
    description VARCHAR(80),
    availability BOOLEAN,
    price FLOAT,
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id)
);


CREATE TABLE order_details (
    order_details_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    menu_item_id INT,
    quantity INT,
    customization_request VARCHAR(100),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_item(menu_item_id)
);

CREATE TABLE fish_market (
    market_id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT,
    market_name VARCHAR(40),
    inbound_quantity INT,
    fish_price FLOAT,
    postal_code VARCHAR(6),
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id),
    FOREIGN KEY (postal_code) REFERENCES full_address(postal_code)
);
CREATE TABLE cards (
   payment_type_id INT AUTO_INCREMENT PRIMARY KEY,
   card_number VARCHAR(16),
   card_holder_name VARCHAR(40),
   postal_code VARCHAR(6),
   FOREIGN KEY (postal_code) REFERENCES full_address(postal_code)
);

CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    payment_date DATE,
    payment_method VARCHAR(5),
    payment_type_id INT,
    tip FLOAT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (payment_type_id) REFERENCES cards(payment_type_id)
);



CREATE TABLE analytics (
    analytics_id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week VARCHAR(20),
    season VARCHAR(20),
    total_ordered INT,
    customer_order_frequency INT,
    discount_eligibility BOOLEAN,
    menu_item_id INT,
    customer_id INT,
    FOREIGN KEY (menu_item_id) REFERENCES menu_item(menu_item_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE discount (
    discount_id INT AUTO_INCREMENT PRIMARY KEY,
    discount_type VARCHAR(50),
    discount_value DECIMAL(10, 2),
    start_date DATE,
    end_date DATE,
    customer_id INT,
    analytics_id INT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (analytics_id) REFERENCES analytics(analytics_id)
);
