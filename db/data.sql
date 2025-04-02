-- Fish Market Test Data Script
-- Run this script to populate your database with test data

-- Clear existing data (if needed)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE discount;
TRUNCATE TABLE analytics;
TRUNCATE TABLE payment;
TRUNCATE TABLE cards;
TRUNCATE TABLE fish_market;
TRUNCATE TABLE order_details;
TRUNCATE TABLE menu_item;
TRUNCATE TABLE orders;
TRUNCATE TABLE employees;
TRUNCATE TABLE customers;
TRUNCATE TABLE users;
TRUNCATE TABLE inventory;
TRUNCATE TABLE full_address;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Addresses
INSERT INTO full_address (postal_code, country, province, city, street_address) VALUES
    ('M5V2H1', 'Canada', 'Ontario', 'Toronto', '123 King Street West'),
    ('M4C1M9', 'Canada', 'Ontario', 'Toronto', '456 Queen Street East'),
    ('V6B2J2', 'Canada', 'British Columbia', 'Vancouver', '789 Granville Street'),
    ('H2Y1C6', 'Canada', 'Quebec', 'Montreal', '101 Rue Sainte-Catherine'),
    ('T2P3C5', 'Canada', 'Alberta', 'Calgary', '202 Stephen Avenue'),
    ('K1P5J2', 'Canada', 'Ontario', 'Ottawa', '303 Sparks Street'),
    ('B3J3R7', 'Canada', 'Nova Scotia', 'Halifax', '404 Spring Garden Road'),
    ('R3C0C4', 'Canada', 'Manitoba', 'Winnipeg', '505 Portage Avenue'),
    ('S7K0J5', 'Canada', 'Saskatchewan', 'Saskatoon', '606 Broadway Avenue'),
    ('E1C4M7', 'Canada', 'New Brunswick', 'Moncton', '707 Main Street');

-- Insert Inventory Items
INSERT INTO inventory (item_name, no_in_stock) VALUES
   ('Atlantic Salmon', 150),
   ('Pacific Cod', 120),
   ('Rainbow Trout', 85),
   ('Halibut', 60),
   ('Arctic Char', 45),
   ('Tilapia', 200),
   ('Sea Bass', 75),
   ('Shrimp', 300),
   ('Lobster', 40),
   ('Blue Mussels', 250),
   ('Oysters', 180),
   ('Clams', 210),
   ('Scallops', 95),
   ('Tuna', 65),
   ('Swordfish', 30);

-- Insert Users (Passwords are hashed versions of 'password123')
-- Note: Using 'password' column assuming that's the correct column name in your schema
-- If your schema uses 'passowrd' (with misspelling), change the column name here
INSERT INTO users (first_name, last_name, phone_number, email_address, user_type, address_id, password) VALUES
-- Admin Users
    ('John', 'Smith', '416-555-0101', 'john.smith@email.com', 'A', 1, '$2b$10$48tP/f7n66xNqW9V483hfudWuKWO8SAJwrb9YNiAjihrIW/A1WfJm'),
    ('Jane', 'Doe', '416-555-0102', 'jane.doe@email.com', 'A', 2, '$2b$10$48tP/f7n66xNqW9V483hfudWuKWO8SAJwrb9YNiAjihrIW/A1WfJm'),

-- Regular Users
    ('Michael', 'Brown', '604-555-0103', 'michael.brown@email.com', 'U', 3, '$2b$10$48tP/f7n66xNqW9V483hfudWuKWO8SAJwrb9YNiAjihrIW/A1WfJm'),
    ('Emily', 'Johnson', '514-555-0104', 'emily.johnson@email.com', 'U', 4, '$2b$10$48tP/f7n66xNqW9V483hfudWuKWO8SAJwrb9YNiAjihrIW/A1WfJm'),
    ('David', 'Wilson', '403-555-0105', 'david.wilson@email.com', 'U', 5, '$2b$10$48tP/f7n66xNqW9V483hfudWuKWO8SAJwrb9YNiAjihrIW/A1WfJm'),
    ('Sophia', 'Taylor', '613-555-0106', 'sophia.taylor@email.com', 'U', 6, '$2b$10$48tP/f7n66xNqW9V483hfudWuKWO8SAJwrb9YNiAjihrIW/A1WfJm'),
    ('James', 'Anderson', '902-555-0107', 'james.anderson@email.com', 'U', 7, '$2b$10$48tP/f7n66xNqW9V483hfudWuKWO8SAJwrb9YNiAjihrIW/A1WfJm'),
    ('Olivia', 'Thomas', '204-555-0108', 'olivia.thomas@email.com', 'U', 8, '$2b$10$48tP/f7n66xNqW9V483hfudWuKWO8SAJwrb9YNiAjihrIW/A1WfJm'),
    ('William', 'Jackson', '306-555-0109', 'william.jackson@email.com', 'U', 9, '$2b$10$48tP/f7n66xNqW9V483hfudWuKWO8SAJwrb9YNiAjihrIW/A1WfJm'),
    ('Ava', 'White', '506-555-0110', 'ava.white@email.com', 'U', 10, '$2b$10$48tP/f7n66xNqW9V483hfudWuKWO8SAJwrb9YNiAjihrIW/A1WfJm');

-- Insert Customers
INSERT INTO customers (user_id) VALUES
    (3), -- Michael Brown
    (4), -- Emily Johnson
    (5), -- David Wilson
    (6), -- Sophia Taylor
    (7), -- James Anderson
    (8), -- Olivia Thomas
    (9), -- William Jackson
    (10); -- Ava White

-- Insert Employees
INSERT INTO employees (user_id, role) VALUES
  (1, 'admin'), -- John Smith
  (2, 'admin'); -- Jane Doe

-- Insert Menu Items
INSERT INTO menu_item (inventory_id, menu_item_name, description, availability, price) VALUES
   (1, 'Grilled Atlantic Salmon', 'Fresh Atlantic salmon fillet, grilled to perfection', true, 22.99),
   (1, 'Salmon Sushi Roll', 'Fresh salmon with avocado and cucumber', true, 14.99),
   (2, 'Fish and Chips', 'Pacific cod battered and fried with house-cut fries', true, 18.99),
   (3, 'Rainbow Trout Almondine', 'Pan-seared trout with toasted almonds and lemon butter', true, 21.99),
   (4, 'Halibut Steak', 'Grilled halibut steak with seasonal vegetables', true, 27.99),
   (5, 'Arctic Char with Dill Sauce', 'Pan-seared Arctic char with creamy dill sauce', true, 24.99),
   (6, 'Blackened Tilapia', 'Cajun-spiced tilapia with mango salsa', true, 19.99),
   (7, 'Sea Bass with Herb Crust', 'Herb-crusted sea bass with white wine sauce', true, 26.99),
   (8, 'Garlic Shrimp Pasta', 'Sautéed shrimp with garlic, white wine, and linguine', true, 20.99),
   (8, 'Coconut Shrimp', 'Crispy coconut-breaded shrimp with sweet chili sauce', true, 16.99),
   (9, 'Steamed Lobster', 'Whole Atlantic lobster with drawn butter', true, 39.99),
   (9, 'Lobster Roll', 'Fresh lobster meat in a buttery roll with lemon aioli', true, 25.99),
   (10, 'Mussels Marinara', 'Blue mussels in a spicy tomato broth with grilled bread', true, 17.99),
   (11, 'Fresh Oysters', 'Half dozen fresh oysters with mignonette sauce', true, 18.99),
   (12, 'Steamed Clams', 'Steamed clams in white wine and garlic broth', true, 16.99),
   (13, 'Seared Scallops', 'Pan-seared scallops with bacon and pea purée', true, 28.99),
   (14, 'Tuna Poke Bowl', 'Raw tuna with rice, avocado, and sesame dressing', true, 19.99),
   (15, 'Grilled Swordfish', 'Grilled swordfish steak with Mediterranean salsa', true, 25.99);

-- Insert Cards first (since they might be referenced by other tables)
-- We're not setting a foreign key on postal_code here, assuming the schema will handle this
INSERT INTO cards (card_number, card_holder_name, postal_code) VALUES
   ('4111111111111111', 'Michael Brown', 'V6B2J2'),
   ('5500000000000004', 'Emily Johnson', 'H2Y1C6'),
   ('340000000000009', 'David Wilson', 'T2P3C5'),
   ('6011000000000004', 'Sophia Taylor', 'K1P5J2'),
   ('6011111111111117', 'James Anderson', 'B3J3R7'),
   ('3088000000000009', 'Olivia Thomas', 'R3C0C4'),
   ('5555341244441115', 'William Jackson', 'S7K0J5'),
   ('5105105105105100', 'Ava White', 'E1C4M7');

-- Insert Market data
INSERT INTO fish_market (inventory_id, market_name, inbound_quantity, fish_price, postal_code) VALUES
   (1, 'Atlantic Fisheries', 50, 12.99, 'M5V2H1'),
   (2, 'Pacific Catch Co.', 40, 10.99, 'V6B2J2'),
   (3, 'Mountain Stream Fish', 30, 11.99, 'T2P3C5'),
   (4, 'Coastal Seafood', 20, 18.99, 'B3J3R7'),
   (5, 'Northern Waters', 15, 16.99, 'K1P5J2'),
   (6, 'Freshwater Farms', 60, 8.99, 'M4C1M9'),
   (7, 'Ocean Harvest', 25, 15.99, 'V6B2J2'),
   (8, 'Bay Shrimp Company', 100, 14.99, 'H2Y1C6'),
   (9, 'Maritime Lobster', 15, 29.99, 'B3J3R7'),
   (10, 'Blue Water Shellfish', 75, 7.99, 'R3C0C4'),
   (11, 'Island Oyster Co.', 60, 12.99, 'S7K0J5'),
   (12, 'Beachside Clams', 70, 9.99, 'E1C4M7'),
   (13, 'Sea Scallop Suppliers', 35, 19.99, 'M5V2H1'),
   (14, 'Deep Sea Tuna', 20, 22.99, 'V6B2J2'),
   (15, 'Oceanic Sword', 10, 24.99, 'H2Y1C6');

-- Insert Orders (past month)
-- Note: The total values should be calculated based on the actual items
INSERT INTO orders (customer_id, order_date, total, status) VALUES
    (1, '2025-02-25', 43.98, 'Processing'),  -- Salmon + Shrimp Pasta
    (2, '2025-02-26', 35.98, 'Completed'),  -- Fish & Chips + Coconut Shrimp
    (3, '2025-02-28', 19.99, 'Completed'),  -- Tilapia
    (4, '2025-03-01', 34.98, 'Completed'),  -- Mussels + Clams
    (5, '2025-03-03', 39.99, 'Completed'),  -- Lobster
    (6, '2025-03-05', 38.98, 'Completed'),  -- Oysters + Poke Bowl
    (7, '2025-03-07', 60.98, 'Pending'),  -- Shrimp Pasta + Lobster
    (8, '2025-03-08', 56.98, 'Completed'),  -- Scallops + Halibut
    (1, '2025-03-10', 51.98, 'Completed'),  -- Salmon + Scallops
    (2, '2025-03-12', 43.98, 'Completed'),  -- Sea Bass + Coconut Shrimp
    (3, '2025-03-15', 82.97, 'Completed'),  -- Lobster + Scallops + Halibut
    (4, '2025-03-17', 57.98, 'Completed'),  -- Garlic Shrimp + Oysters
    (5, '2025-03-18', 34.98, 'Completed'),  -- Sushi + Poke Bowl
    (6, '2025-03-20', 25.99, 'Processing'), -- Lobster Roll
    (7, '2025-03-22', 46.98, 'Processing'), -- Fish & Chips + Mussels
    (8, '2025-03-23', 39.99, 'Processing'), -- Lobster
    (1, '2025-03-24', 44.98, 'Processing'), -- Trout + Shrimp Pasta
    (2, '2025-03-25', 52.97, 'Pending');    -- Sea Bass + Poke Bowl

-- Insert Order Details
-- Make sure quantities match the totals in the orders table
INSERT INTO order_details (order_id, menu_item_id, quantity, customization_request) VALUES
    (1, 1, 1, 'Medium rare, extra lemon'),        -- Grilled Salmon 22.99
    (1, 8, 1, 'Light on the garlic'),            -- Garlic Shrimp Pasta 20.99
    (2, 3, 1, 'Extra crispy batter'),            -- Fish and Chips 18.99
    (2, 10, 1, 'Extra sauce on the side'),       -- Coconut Shrimp 16.99
    (3, 6, 1, 'Spicy'),                          -- Blackened Tilapia 19.99
    (4, 13, 1, 'Extra mussels please'),          -- Mussels Marinara 17.99
    (4, 15, 1, NULL),                            -- Steamed Clams 16.99
    (5, 11, 1, 'Butter on the side'),            -- Steamed Lobster 39.99
    (6, 14, 1, 'Extra wasabi'),                  -- Fresh Oysters 18.99
    (6, 17, 1, NULL),                            -- Tuna Poke Bowl 19.99
    (7, 9, 1, 'Whole wheat pasta if available'), -- Garlic Shrimp Pasta 20.99
    (7, 11, 1, NULL),                            -- Steamed Lobster 39.99
    (8, 16, 1, 'Light on the bacon'),            -- Seared Scallops 28.99
    (8, 5, 1, NULL),                             -- Halibut Steak 27.99
    (9, 1, 1, 'Well done'),                      -- Grilled Salmon 22.99
    (9, 16, 1, 'Extra scallops if possible'),    -- Seared Scallops 28.99
    (10, 7, 1, NULL),                            -- Sea Bass 26.99
    (10, 10, 1, 'Extra crispy'),                 -- Coconut Shrimp 16.99
    (11, 11, 1, NULL),                           -- Steamed Lobster 39.99
    (11, 16, 1, NULL),                           -- Seared Scallops 28.99
    (11, 5, 1, 'Light seasoning'),               -- Halibut Steak 27.99
    (12, 9, 1, 'Extra garlic'),                  -- Garlic Shrimp Pasta 20.99
    (12, 14, 1, 'No sesame'),                    -- Fresh Oysters 18.99
    (13, 2, 1, 'Extra avocado'),                 -- Salmon Sushi Roll 14.99
    (13, 17, 1, NULL),                           -- Tuna Poke Bowl 19.99
    (14, 12, 1, 'Extra lemon aioli'),            -- Lobster Roll 25.99
    (15, 3, 1, 'Extra fries'),                   -- Fish and Chips 18.99
    (15, 13, 1, 'Spicy broth'),                  -- Mussels Marinara 17.99
    (16, 11, 1, 'Butter on the side'),           -- Steamed Lobster 39.99
    (17, 4, 1, 'Extra almonds'),                 -- Rainbow Trout 21.99
    (17, 9, 1, 'Light on the sauce'),            -- Garlic Shrimp Pasta 20.99
    (18, 7, 1, 'Extra herbs'),                   -- Sea Bass 26.99
    (18, 17, 1, NULL);                           -- Tuna Poke Bowl 19.99

-- Insert Payment Data (for completed orders only)
-- Note: Only inserting for orders with 'Completed' status
INSERT INTO payment (order_id, payment_date, payment_method, payment_type_id, tip) VALUES
   (1, '2025-02-25', 'card', 1, 5.00),  -- Michael Brown's card
   (2, '2025-02-26', 'card', 2, 7.50),  -- Emily Johnson's card
   (3, '2025-02-28', 'card', 3, 4.25),  -- David Wilson's card
   (4, '2025-03-01', 'card', 4, 6.00),  -- Sophia Taylor's card
   (5, '2025-03-03', 'card', 5, 8.00),  -- James Anderson's card
   (6, '2025-03-05', 'card', 6, 5.50),  -- Olivia Thomas's card
   (7, '2025-03-07', 'card', 7, 10.00), -- William Jackson's card
   (8, '2025-03-08', 'card', 8, 7.25),  -- Ava White's card
   (9, '2025-03-10', 'card', 1, 8.50),  -- Michael Brown's card again
   (10, '2025-03-12', 'card', 2, 6.75), -- Emily Johnson's card again
   (11, '2025-03-15', 'card', 3, 12.50), -- David Wilson's card again
   (12, '2025-03-17', 'card', 4, 9.00),  -- Sophia Taylor's card again
   (13, '2025-03-18', 'card', 5, 6.25);  -- James Anderson's card again

-- Insert Analytics Data
INSERT INTO analytics (day_of_week, season, total_ordered, customer_order_frequency, discount_eligibility, menu_item_id, customer_id, sales_growth_rate, customer_retention_rate, peak_hours) VALUES
  ('Friday', 'Winter', 42, 3, true, 1, 1, 3.5, 85.2, '18:00-20:00'),
  ('Saturday', 'Winter', 38, 2, true, 3, 2, 2.8, 78.5, '19:00-21:00'),
  ('Monday', 'Winter', 25, 1, false, 6, 3, 1.5, 62.3, '12:00-14:00'),
  ('Wednesday', 'Winter', 30, 2, true, 9, 4, 2.1, 73.8, '13:00-15:00'),
  ('Friday', 'Winter', 45, 4, true, 11, 5, 4.2, 89.5, '18:00-20:00'),
  ('Sunday', 'Winter', 22, 1, false, 14, 6, 1.2, 58.7, '17:00-19:00'),
  ('Tuesday', 'Spring', 28, 2, true, 16, 7, 1.8, 66.4, '12:00-14:00'),
  ('Thursday', 'Spring', 33, 3, true, 18, 8, 2.5, 75.2, '19:00-21:00');

-- Insert Discount Data
-- Note: Only creating discounts that reference existing analytics_id values
INSERT INTO discount (discount_type, discount_value, start_date, end_date, customer_id, analytics_id) VALUES
  ('Loyalty Discount', 10.00, '2025-03-01', '2025-04-01', 1, 1),
  ('Seasonal Promotion', 15.00, '2025-03-15', '2025-04-15', 2, 2),
  ('First-Time Customer', 5.00, '2025-03-10', '2025-03-31', 3, 3),
  ('Birthday Special', 20.00, '2025-03-20', '2025-03-27', 4, 4),
  ('Frequent Buyer', 12.50, '2025-03-05', '2025-04-05', 5, 5);

-- Insert Expense Categories
INSERT INTO expense_category (category_name, description) VALUES
  ('Inventory Purchase', 'Expenses related to purchasing inventory items'),
  ('Utilities', 'Expenses for electricity, water, gas, etc.'),
  ('Rent', 'Monthly rent for restaurant space'),
  ('Payroll', 'Employee salaries and wages'),
  ('Marketing', 'Advertising and promotional expenses'),
  ('Equipment', 'Kitchen equipment and maintenance'),
  ('Insurance', 'Business insurance premiums'),
  ('Miscellaneous', 'Other operational expenses');

-- Insert Expense Data
INSERT INTO expense (category_id, amount, expense_date, description, payment_method, reference_number) VALUES
  (1, 4500.00, '2025-01-15', 'Seafood inventory purchase', 'Bank Transfer', 'INV-2025-0115'),
  (1, 3800.00, '2025-02-12', 'Seafood inventory purchase', 'Bank Transfer', 'INV-2025-0212'),
  (1, 5200.00, '2025-03-10', 'Seafood inventory purchase', 'Bank Transfer', 'INV-2025-0310'),
  (2, 850.00, '2025-01-05', 'January utilities payment', 'Check', 'UTL-2025-0105'),
  (2, 820.00, '2025-02-05', 'February utilities payment', 'Check', 'UTL-2025-0205'),
  (2, 880.00, '2025-03-05', 'March utilities payment', 'Check', 'UTL-2025-0305'),
  (3, 3500.00, '2025-01-01', 'January rent payment', 'Bank Transfer', 'RENT-2025-0101'),
  (3, 3500.00, '2025-02-01', 'February rent payment', 'Bank Transfer', 'RENT-2025-0201'),
  (3, 3500.00, '2025-03-01', 'March rent payment', 'Bank Transfer', 'RENT-2025-0301'),
  (4, 12500.00, '2025-01-30', 'January payroll', 'Bank Transfer', 'PAY-2025-0130'),
  (4, 12500.00, '2025-02-28', 'February payroll', 'Bank Transfer', 'PAY-2025-0228'),
  (4, 13200.00, '2025-03-30', 'March payroll (with bonuses)', 'Bank Transfer', 'PAY-2025-0330'),
  (5, 1200.00, '2025-01-10', 'Winter promotion campaign', 'Credit Card', 'MKT-2025-0110'),
  (5, 800.00, '2025-02-15', 'Social media advertising', 'Credit Card', 'MKT-2025-0215'),
  (5, 1500.00, '2025-03-15', 'Spring promotion campaign', 'Credit Card', 'MKT-2025-0315'),
  (6, 2200.00, '2025-01-20', 'New refrigerator purchase', 'Credit Card', 'EQP-2025-0120'),
  (6, 350.00, '2025-02-18', 'Equipment maintenance', 'Credit Card', 'EQP-2025-0218'),
  (6, 1800.00, '2025-03-25', 'New kitchen tools', 'Credit Card', 'EQP-2025-0325'),
  (7, 1200.00, '2025-01-15', 'Quarterly insurance premium', 'Bank Transfer', 'INS-2025-0115'),
  (8, 450.00, '2025-01-25', 'Office supplies', 'Credit Card', 'MISC-2025-0125'),
  (8, 380.00, '2025-02-22', 'Cleaning supplies', 'Credit Card', 'MISC-2025-0222'),
  (8, 520.00, '2025-03-18', 'Staff uniforms', 'Credit Card', 'MISC-2025-0318');

-- Insert Inventory Expense Data
INSERT INTO inventory_expense (expense_id, inventory_id, quantity, unit_cost) VALUES
  (1, 1, 50, 15.00),
  (1, 2, 40, 12.50),
  (1, 3, 30, 14.00),
  (2, 4, 25, 20.00),
  (2, 5, 20, 18.50),
  (2, 6, 60, 10.00),
  (3, 7, 30, 16.00),
  (3, 8, 100, 15.00),
  (3, 9, 15, 30.00);

-- Insert Market Price History Data
INSERT INTO market_price_history (inventory_id, market_id, price_date, price_amount) VALUES
  -- Atlantic Salmon (inventory_id: 1, market_id: 1) price history
  (1, 1, '2025-01-05', 12.99),
  (1, 1, '2025-01-12', 13.25),
  (1, 1, '2025-01-19', 13.50),
  (1, 1, '2025-01-26', 13.75),
  (1, 1, '2025-02-02', 14.00),
  (1, 1, '2025-02-09', 13.85),
  (1, 1, '2025-02-16', 13.50),
  (1, 1, '2025-02-23', 13.25),
  (1, 1, '2025-03-02', 12.85),
  (1, 1, '2025-03-09', 12.50),
  (1, 1, '2025-03-16', 12.25),
  (1, 1, '2025-03-23', 12.00),
  
  -- Pacific Cod (inventory_id: 2, market_id: 2) price history
  (2, 2, '2025-01-05', 10.99),
  (2, 2, '2025-01-12', 11.25),
  (2, 2, '2025-01-19', 11.50),
  (2, 2, '2025-01-26', 11.85),
  (2, 2, '2025-02-02', 12.15),
  (2, 2, '2025-02-09', 12.25),
  (2, 2, '2025-02-16', 11.95),
  (2, 2, '2025-02-23', 11.75),
  (2, 2, '2025-03-02', 11.50),
  (2, 2, '2025-03-09', 11.25),
  (2, 2, '2025-03-16', 10.95),
  (2, 2, '2025-03-23', 10.75),
  
  -- Lobster (inventory_id: 9, market_id: 9) price history
  (9, 9, '2025-01-05', 29.99),
  (9, 9, '2025-01-12', 30.50),
  (9, 9, '2025-01-19', 31.25),
  (9, 9, '2025-01-26', 32.00),
  (9, 9, '2025-02-02', 33.50),
  (9, 9, '2025-02-09', 34.25),
  (9, 9, '2025-02-16', 35.00),
  (9, 9, '2025-02-23', 34.50),
  (9, 9, '2025-03-02', 33.75),
  (9, 9, '2025-03-09', 32.50),
  (9, 9, '2025-03-16', 31.25),
  (9, 9, '2025-03-23', 30.75);

-- Insert Sales Trends Data
INSERT INTO sales_trends (period_type, period_start, period_end, total_sales, total_orders, average_order_value, highest_selling_item_id, highest_selling_item_count) VALUES
  ('daily', '2025-03-01', '2025-03-01', 524.95, 15, 34.99, 1, 8),
  ('daily', '2025-03-02', '2025-03-02', 612.50, 18, 34.03, 3, 9),
  ('daily', '2025-03-03', '2025-03-03', 485.75, 14, 34.70, 6, 7),
  ('daily', '2025-03-04', '2025-03-04', 420.25, 12, 35.02, 9, 6),
  ('daily', '2025-03-05', '2025-03-05', 550.80, 16, 34.43, 11, 5),
  ('daily', '2025-03-06', '2025-03-06', 590.45, 17, 34.73, 8, 8),
  ('daily', '2025-03-07', '2025-03-07', 675.30, 20, 33.77, 1, 6),
  ('weekly', '2025-02-24', '2025-03-02', 3250.50, 95, 34.22, 1, 32),
  ('weekly', '2025-03-03', '2025-03-09', 3650.75, 105, 34.77, 9, 28),
  ('weekly', '2025-03-10', '2025-03-16', 3825.25, 110, 34.78, 3, 30),
  ('weekly', '2025-03-17', '2025-03-23', 4100.50, 118, 34.75, 11, 32),
  ('monthly', '2025-01-01', '2025-01-31', 14500.75, 420, 34.53, 1, 115),
  ('monthly', '2025-02-01', '2025-02-28', 15750.50, 450, 35.00, 9, 125),
  ('monthly', '2025-03-01', '2025-03-31', 16850.25, 485, 34.74, 3, 130);

-- Insert Discount Usage Data
INSERT INTO discount_usage (discount_id, order_id, applied_amount, usage_date) VALUES
  (1, 9, 5.20, '2025-03-10 14:32:15'),
  (2, 10, 6.60, '2025-03-12 18:45:22'),
  (3, 11, 4.15, '2025-03-15 12:15:08'),
  (4, 12, 11.60, '2025-03-17 19:22:35'),
  (5, 13, 4.37, '2025-03-18 13:08:42');

-- Insert Customer Preferences Data
INSERT INTO customer_preferences (customer_id, menu_item_id, order_count, last_ordered, discount_eligible) VALUES
  (1, 1, 8, '2025-03-24', true),
  (1, 9, 5, '2025-03-24', false),
  (1, 16, 3, '2025-03-10', false),
  (2, 3, 6, '2025-03-25', true),
  (2, 10, 5, '2025-03-25', true),
  (2, 7, 4, '2025-03-25', false),
  (3, 6, 7, '2025-03-15', true),
  (3, 5, 4, '2025-03-15', false),
  (3, 16, 3, '2025-03-15', false),
  (4, 13, 6, '2025-03-17', true),
  (4, 14, 5, '2025-03-17', true),
  (4, 17, 2, '2025-03-17', false),
  (5, 11, 8, '2025-03-18', true),
  (5, 2, 5, '2025-03-18', true),
  (5, 16, 3, '2025-03-18', false);

-- End of seed data script
-- To confirm all data was loaded correctly, you can run:
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM orders;
-- SELECT COUNT(*) FROM menu_item;