import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchDataStock, fetchImageProducts, fetchImageQrcode, selectData, selectImageProducts, selectImageQrcodes } from '../data/stockSlice';
import { DataGrid } from '@mui/x-data-grid';



const TailwindModal = ({ show, onClose, imageSrc, title = "Image Preview" }) => {
    if (!show) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="relative p-4 w-full max-w-2xl max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
  
            {/* Modal body */}
            <div className="p-4 space-y-4">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Preview"
                  className="w-full h-auto max-w-md max-h-96 object-contain mx-auto"
                />
              ) : (
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  No image available
                </p>
              )}
            </div>
  
            {/* Modal footer */}
            <div className="flex items-center p-4 border-t border-gray-200 rounded-b dark:border-gray-600">
              <button
                onClick={onClose}
                className="bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


const Store = () => {
    const dispatch = useDispatch();
    const data = useSelector(selectData);
    const error = useSelector(state => state.stock.error);
    const imageProduct = useSelector(selectImageProducts);
    const imageQrcode = useSelector(selectImageQrcodes);
    
    const [selectedRows, setSelectedRows] = useState([]);
    const [preview, setPreview] = useState({ image: null, type: null, show: false });
    const [loadingButtons, setLoadingButtons] = useState({});

    // Fetch data on component mount
    useEffect(() => {
        dispatch(fetchDataStock());
    }, [dispatch]);

    // Update preview state when images are available
    useEffect(() => {
        if (preview.type === 'product' && imageProduct) {
            setPreview(prev => ({ ...prev, image: imageProduct }));
        } else if (preview.type === 'qrcode' && imageQrcode) {
            setPreview(prev => ({ ...prev, image: imageQrcode }));
        }
    }, [imageProduct, imageQrcode, preview.type]);

    const handlePreviewClick = async (id, type) => {
        setLoadingButtons(prev => ({ ...prev, [id + type]: true }));
        try {
            if (type === 'product') {
                await dispatch(fetchImageProducts(id));
            } else if (type === 'qrcode') {
                await dispatch(fetchImageQrcode(id));
            }
            setPreview({ type, show: true });
        } catch (error) {
            console.error(`Error fetching ${type} image for ${id}:`, error);
        } finally {
            setLoadingButtons(prev => ({ ...prev, [id + type]: false }));
        }
    };

    const closePreview = () => {
        setPreview({ image: null, type: null, show: false });
    };

    const getPreviewImageSrc = () => {
        return preview.image ? `data:image/jpeg;base64,${preview.image}` : null;
    };

    const handleRowSelection = (newSelection) => {
        setSelectedRows(newSelection);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 150 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'price', headerName: 'Price', width: 200 },
        {
            field: 'image',
            headerName: 'Image',
            width: 150,
            renderCell: (params) => {
                const id = params.row.id;
                return (
                    <button
                        className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 w-full rounded text-sm transition ease-in-out duration-300 ${
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
            width: 150,
            renderCell: (params) => {
                const id = params.row.id;
                return (
                    <button
                        className={`bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 w-full rounded text-sm transition ease-in-out duration-300 ${
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
        { field: 'details', headerName: 'Details', width: 200 },
    ];

    const rows = data.map(product => ({
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
                <h2 className="text-sl text-gray-600 mt-2">Mange Your Temi Store</h2>
            </div>
          
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    style={{ backgroundColor: 'white' }}
                    rows={rows}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
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
            <TailwindModal
                show={preview.show}
                onClose={closePreview}
                imageSrc={getPreviewImageSrc()}
            />
        </div>
        
    );
};

export default Store;
