-- This script drops all tables in the database for a clean slate
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all analytics-related tables
DROP TABLE IF EXISTS discount_usage;
DROP TABLE IF EXISTS market_price_history;
DROP TABLE IF EXISTS customer_preferences;
DROP TABLE IF EXISTS sales_forecast;
DROP TABLE IF EXISTS sales_trends;
DROP TABLE IF EXISTS inventory_expense;
DROP TABLE IF EXISTS expense;
DROP TABLE IF EXISTS expense_category;
DROP TABLE IF EXISTS discount;
DROP TABLE IF EXISTS analytics;

-- Drop core business tables
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS order_details;
DROP TABLE IF EXISTS menu_item;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS fish_market;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS full_address;

SET FOREIGN_KEY_CHECKS = 1;