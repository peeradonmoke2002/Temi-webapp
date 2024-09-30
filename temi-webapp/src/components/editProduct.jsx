import React, { useState, useEffect } from 'react';

const EditProductModal = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price,
    productImage: product.product_image,
    qrCodeImage: product.qr_code_image,
    details: product.detail
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file change (convert to base64)
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData({
        ...formData,
        [name]: reader.result.split(',')[1] // Remove base64 prefix
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onSave({
      id: product.id,
      name: formData.name,
      price: formData.price,
      product_image: formData.productImage,
      qr_code_image: formData.qrCodeImage,
      detail: formData.details
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="relative p-4 w-full max-w-lg max-h-full bg-white rounded-lg shadow dark:bg-gray-700">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Product</h3>
          <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg w-8 h-8">
            <span>×</span>
          </button>
        </div>

        {/* Modal body */}
        <div className="p-4 space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Product Name"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Price"
            className="w-full p-2 border rounded"
          />
          <textarea
            name="details"
            value={formData.details}
            onChange={handleInputChange}
            placeholder="Details"
            className="w-full p-2 border rounded"
          />

          {/* Product Image Upload */}
          <label>Image</label>
          <input
            type="file"
            name="productImage"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />

          {/* QR Code Image Upload */}
          <label>Image</label>
          <input
            type="file"
            name="qrCodeImage"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Modal footer */}
        <div className="flex justify-end p-4 border-t dark:border-gray-600">
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
