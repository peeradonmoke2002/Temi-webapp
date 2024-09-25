import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchDataStock, addProduct, updateProduct, deleteProduct, selectData } from '../data/stockSlice';
import { DataGrid } from '@mui/x-data-grid';
import TailwindModal from './Modal';
import AddProductModal from './addProduct';
import EditProductModal from './editProduct';
import axios from 'axios'; 
// Import MUI icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import config from "../config/configureAPI";
const currentUrl = window.location.href;
const isDeploy = currentUrl.includes('localhost') ? 'development' : 'production';  
const environment = process.env.NODE_ENV || isDeploy;
const API = config[environment].API;

const Store = () => {
  const dispatch = useDispatch();
  const data = useSelector(selectData); 
  const error = useSelector(state => state.stock.error);

  const [selectedRows, setSelectedRows] = useState([]);
  const [preview, setPreview] = useState({ image: null, type: null, show: false });
  const [loadingButtons, setLoadingButtons] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [localData, setLocalData] = useState([]); 
  const [commandData, setCommand] = useState('');

  useEffect(() => {
    dispatch(fetchDataStock());
  }, [dispatch]);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleRowSelection = useCallback((newSelection) => {
    setSelectedRows(newSelection);
  }, []);

  const handlePreviewClick = useCallback(async (id, type) => {
    setLoadingButtons(prev => ({ ...prev, [id + type]: true }));
    try {
      let url = '';
      if (type === 'product') {
        url = `${API}/api/productImage/${id}`;
      } else if (type === 'qrcode') {
        url = `${API}/api/qrCodeImage/${id}`;
      }
      
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const base64String = btoa(
        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
  
      setPreview({
        image: `data:image/png;base64,${base64String}`, 
        type,
        show: true
      });
    } catch (error) {
      console.error(`Error fetching ${type} image for ${id}:`, error);
    } finally {
      setLoadingButtons(prev => ({ ...prev, [id + type]: false }));
    }
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedRows.length > 0) {
      const updatedData = localData.filter(product => !selectedRows.includes(product.id));
      setLocalData(updatedData);
      selectedRows.forEach(rowId => dispatch(deleteProduct(rowId)));
    }
  }, [selectedRows, localData, dispatch]);

  const handleEdit = useCallback(() => {
    if (selectedRows.length === 1) {
      const productToEdit = localData.find(product => product.id === selectedRows[0]);
      setCurrentProduct(productToEdit);
      setShowEditModal(true);
    }
  }, [selectedRows, localData]);

  const handleAdd = useCallback(() => {
    setCurrentProduct(null); 
    setShowAddModal(true);
  }, []);

  const handleSaveEdit = (editedProduct) => {
    const { detail, name, price, product_image, qr_code_image } = editedProduct;

    // if (!detail || !name || !price || !product_image || !qr_code_image) {
    //     console.warn('One or more required fields are empty. Nothing to add.');
    //     setShowEditModal(false);
    //     return;
    // }

    const updatedData = localData.map(product =>
      product.id === editedProduct.id ? editedProduct : product
    );
    setLocalData(updatedData);
    dispatch(updateProduct(editedProduct));
  
    let newCommand = 'UPDATE';
    axios.post(`${API}/update-store`, { command: newCommand })
      .then(response => console.log('Command sent:', response.data))
      .catch(error => console.error('Error sending command:', error));
  
    setShowEditModal(false);
  };

const handleSaveAdd = useCallback((newProduct) => {
    const { detail, name, price, product_image, qr_code_image } = newProduct;

    // if (!detail || !name || !price || !product_image || !qr_code_image) {
    //     console.warn('One or more required fields are empty. Nothing to add.');
    //     setShowAddModal(false);
    //     return;
    // }

    console.log('New Product:', newProduct);

    dispatch(addProduct(newProduct))
        .unwrap()
        .then((addedProduct) => {
            setLocalData((prevData) => {
                // Ensure no duplicates by filtering out any existing product with the same ID
                const filteredData = prevData.filter(product => product.id !== addedProduct.id);
                return [...filteredData, addedProduct];
            });
        })
        .catch((error) => {
            console.error("Failed to add product:", error);
        });

    let newCommand = 'UPDATE';
    axios.post(`${API}/update-store`, { command: newCommand })
        .then(response => console.log('Command sent:', response.data))
        .catch(error => console.error('Error sending command:', error));

    setShowAddModal(false);
}, [dispatch]);

  const closePreview = useCallback(() => {
    setPreview({ image: null, type: null, show: false });
  }, []);

  const columns = [
    // { field: 'id', headerName: 'ID', width: 150 },
    { field: 'name', headerName: 'Name', width: 250 },
    { field: 'price', headerName: 'Price', width: 200 },
    {
      field: 'image',
      headerName: 'Image',
      width: 200,
      renderCell: (params) => {
        const id = params.row.id;
        return (
          <button
            className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 w-full rounded-full text-sm transition ease-in-out duration-300 ${
              loadingButtons[id + 'product'] ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handlePreviewClick(id, 'product')}
            disabled={loadingButtons[id + 'product']}
          >
            Preview Image
          </button>
        );
      }
    },
    {
      field: 'qrcode',
      headerName: 'QR Code',
      width: 200,
      renderCell: (params) => {
        const id = params.row.id;
        return (
          <button
            className={`bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 w-full rounded-full text-sm transition ease-in-out duration-300 ${
              loadingButtons[id + 'qrcode'] ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handlePreviewClick(id, 'qrcode')}
            disabled={loadingButtons[id + 'qrcode']}
          >
            Preview QR Code
          </button>
        );
      }
    },
    { field: 'details', headerName: 'Details', width: 250 },
  ];

  const rows = localData.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.id,
    qrcode: product.id,
    details: product.detail,
  }));

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-600">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Server is not available. Please try again later.</span>
        </div>
        <button
          className="bg-blue-500 text-white font-semibold py-2 px-4 rounded mt-3 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          onClick={() => dispatch(fetchDataStock())}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col justify-center items-center w-full py-4">
        <h1 className="text-4xl font-bold text-gray-800">Store</h1>
        <h2 className="text-xl text-gray-600 mt-2">Manage Your Temi Store</h2>
        <hr className="my-4 border-t-2 border-gray-300 w-full" />
    </div>
      {/* Action Buttons */}
      <div className="flex justify-start space-x-4 mb-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full inline-flex items-center"
          onClick={handleAdd}
        >
          <AddIcon className="mr-2" /> Add Product
        </button>
        <button
          className={`bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full inline-flex items-center ${
            selectedRows.length === 1 ? '' : 'opacity-50 cursor-not-allowed'
          }`}
          onClick={handleEdit}
          disabled={selectedRows.length !== 1}
        >
          <EditIcon className="mr-2" /> Edit Product
        </button>
        <button
          className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full inline-flex items-center ${
            selectedRows.length > 0 ? '' : 'opacity-50 cursor-not-allowed'
          }`}
          onClick={handleDelete}
          disabled={selectedRows.length === 0}
        >
          <DeleteIcon className="mr-2" /> Delete Product
        </button>
      </div>

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          style={{ backgroundColor: 'white' }}
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id} 
          initialState={{
            pagination: {
                paginationModel: { page: 1, pageSize: 5 },
            }
          }}
          sx={{ overflow: 'clip' }}
          onRowSelectionModelChange={handleRowSelection}
          checkboxSelection
          selectionModel={selectedRows}
          disableColumnResize
          disableColumnReorder
          disableColumnMenu
          disableSelectionOnClick
          disableRowSelectionOnClick
          disableColumnSelector
        />
      </div>

      {/* Preview Modal */}
      <TailwindModal
        show={preview.show}
        onClose={closePreview}
        imageSrc={preview.image}
      />

      {/* Add/Edit Modal Logic here */}
      {showEditModal && (
        <EditProductModal
          product={currentProduct}
          onSave={handleSaveEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showAddModal && (
        <AddProductModal
          onSave={handleSaveAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default Store;
