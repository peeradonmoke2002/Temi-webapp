#!/usr/local/bin/python3
import requests
import cv2
import numpy as np
import base64

# API endpoint to fetch the product data
url = 'http://localhost:3002/api/products'

# Make a GET request to fetch data from the API
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    # Parse the JSON data
    data = response.json()

    # Assuming we are interested in the first product's image for demonstration
    product_image_binary = data[0]['product_image']  # Adjust the index based on the product
    qr_code_image_binary = data[0]['qr_code_image']  # Adjust the index based on the product

    # Convert the base64-encoded binary image data to raw binary
    image_bytes = base64.b64decode(product_image_binary)
    qr_code_bytes = base64.b64decode(qr_code_image_binary)

    # Convert bytes to a numpy array
    np_array = np.frombuffer(image_bytes, np.uint8)
    qr_np_array = np.frombuffer(qr_code_bytes, np.uint8)

    # Decode the image data to OpenCV format
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    qr_code_image = cv2.imdecode(qr_np_array, cv2.IMREAD_COLOR)

    # Display the image using OpenCV
    if image is not None:
        cv2.imshow("Product Image", image)
        cv2.imshow("QR Code Image", qr_code_image)
        cv2.waitKey(0)  # Wait for a key press to close the window
        cv2.destroyAllWindows()
    else:
        print("Failed to decode the image")
else:
    print(f"Failed to fetch data from API. Status code: {response.status_code}")
