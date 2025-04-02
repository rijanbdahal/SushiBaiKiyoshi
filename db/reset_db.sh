#!/bin/bash

# This script resets the database by running the SQL files in order
# It should be run from the db directory as: ./reset_db.sh

# Configuration - adjust these values
DB_USER="root"
DB_PASS="password"
DB_NAME="fish_market_db"
DB_HOST="localhost"
DB_PORT="3306"

# Check if MySQL client is installed
if ! command -v mysql &> /dev/null; then
    echo "Error: MySQL client is not installed. Please install it first."
    exit 1
fi

# Create the database if it doesn't exist
echo "Creating database $DB_NAME if it doesn't exist..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

# Run the schema creation script
echo "Dropping all tables and recreating schema..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME < cleardb.sql
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME < db.sql

# Run the data population script
echo "Populating the database with sample data..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME < data.sql

echo "Database reset completed successfully!"