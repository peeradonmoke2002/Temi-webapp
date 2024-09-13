#!/usr/local/bin/python3
import psycopg2

# Function to read image as binary data
def read_image_as_binary(image_path):
    with open(image_path, "rb") as image_file:
        binary_data = image_file.read()
    return binary_data

# Database connection details
db_config = {
    'dbname': 'temi_store_db',
    'user': 'peeradon',
    'password': '1234',
    'host': 'localhost',
    'port': '5432'  # Default PostgreSQL port
}

# Path to the images
product_image_path = '/Users/peeradonruengkaew/Downloads/bread.png'
qr_code_image_path = '/Users/peeradonruengkaew/Downloads/QR_payment.png'

# Read images as binary data
product_image_binary = read_image_as_binary(product_image_path)
qr_code_image_binary = read_image_as_binary(qr_code_image_path)

# SQL Insert Query
insert_query = """
    INSERT INTO store (name, price, product_image, qr_code_image, detail)
    VALUES (%s, %s, %s, %s, %s)
"""

# Product details
product_data = (
    'Bread',  # Product name
    35.00,  # Price
    psycopg2.Binary(product_image_binary),  # Product image (binary data)
    psycopg2.Binary(qr_code_image_binary),  # QR code image (binary data)
    'Freshly baked bread'  # Detail/description
)

try:
    # Connect to PostgreSQL
    connection = psycopg2.connect(**db_config)
    cursor = connection.cursor()

    # Execute the insert query
    cursor.execute(insert_query, product_data)

    # Commit the transaction
    connection.commit()

    print("Product successfully inserted.")

except (Exception, psycopg2.DatabaseError) as error:
    print(f"Error: {error}")
finally:
    if connection:
        cursor.close()
        connection.close()
        print("PostgreSQL connection is closed.")
