import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = 'http://localhost:3002';

// Utility function to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Fetch product metadata only
export const fetchDataStock = createAsyncThunk(
  'stock/fetchDataStock',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API}/api/products/data`);
      return response.data; // Metadata only (no images)
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Connection error');
    }
  }
);

// Fetch product image and store it in Redux
export const fetchImageProducts = createAsyncThunk(
  'stock/fetchImageProducts',
  async (id, { rejectWithValue }) => {
    try {
      const url = `${API}/api/productImage/${id}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return { id, image: arrayBufferToBase64(response.data) }; // Store image in Redux
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Connection error');
    }
  }
);

// Fetch QR code image and store it in Redux
export const fetchImageQrcode = createAsyncThunk(
  'stock/fetchImageQrcode',
  async (id, { rejectWithValue }) => {
    try {
      const url = `${API}/api/qrCodeImage/${id}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return { id, image: arrayBufferToBase64(response.data) }; // Store QR code image in Redux
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Connection error');
    }
  }
);

// Add product
export const addProduct = createAsyncThunk(
  'stock/addProduct',
  async (newProduct, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API}/api/products/add`, newProduct);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Connection error');
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  'stock/updateProduct',
  async (updatedProduct, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API}/api/products/updateData/${updatedProduct.id}`, updatedProduct);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Connection error');
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  'stock/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API}/api/products/delete/${id}`);
      return id; // Return the ID of the deleted product
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Connection error');
    }
  }
);

// Stock slice
const stockSlice = createSlice({
  name: 'stock',
  initialState: {
    data: [], // Product metadata
    image_products: {}, // Images for products by ID
    image_qrcodes: {}, // QR code images by ID
    loadingData: false,
    loadingImages: false,
    error: null,
  },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch product metadata
      .addCase(fetchDataStock.pending, (state) => {
        state.loadingData = true;
        state.error = null;
      })
      .addCase(fetchDataStock.fulfilled, (state, action) => {
        state.loadingData = false;
        state.data = action.payload;
      })
      .addCase(fetchDataStock.rejected, (state, action) => {
        state.loadingData = false;
        state.error = action.payload || 'Failed to fetch data';
      })
      // Fetch product image
      .addCase(fetchImageProducts.pending, (state) => {
        state.loadingImages = true;
        state.error = null;
      })
      .addCase(fetchImageProducts.fulfilled, (state, action) => {
        state.loadingImages = false;
        state.image_products[action.payload.id] = action.payload.image; // Store image by ID
      })
      .addCase(fetchImageProducts.rejected, (state, action) => {
        state.loadingImages = false;
        state.error = action.payload || 'Failed to fetch product image';
      })
      // Fetch QR code image
      .addCase(fetchImageQrcode.pending, (state) => {
        state.loadingImages = true;
        state.error = null;
      })
      .addCase(fetchImageQrcode.fulfilled, (state, action) => {
        state.loadingImages = false;
        state.image_qrcodes[action.payload.id] = action.payload.image; // Store QR code by ID
      })
      .addCase(fetchImageQrcode.rejected, (state, action) => {
        state.loadingImages = false;
        state.error = action.payload || 'Failed to fetch QR code image';
      })
      // Add product
      .addCase(addProduct.pending, (state) => {
        state.loadingData = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loadingData = false;
        state.data.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loadingData = false;
        state.error = action.payload || 'Failed to add product';
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loadingData = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loadingData = false;
        const index = state.data.findIndex((product) => product.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload; // Update the product in the data array
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loadingData = false;
        state.error = action.payload || 'Failed to update product';
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loadingData = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loadingData = false;
        state.data = state.data.filter((product) => product.id !== action.payload); // Remove deleted product
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loadingData = false;
        state.error = action.payload || 'Failed to delete product';
      });
  },
});

export const { setData } = stockSlice.actions;

// Selectors
export const selectData = (state) => state.stock.data;
export const selectImageProducts = (state) => state.stock.image_products;
export const selectImageQrcodes = (state) => state.stock.image_qrcodes;

export default stockSlice.reducer;
