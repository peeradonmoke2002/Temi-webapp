import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

const API = 'http://localhost:3002';



// Fetch data action using createAsyncThunk
export const fetchDataStock = createAsyncThunk(
    'data/fetchDataStock',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API}/api/products/data`, { params: { longPoll: true } });
            console.log('Data fetched from API:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching data from API', error);
            return rejectWithValue(error.response?.data || error.message || 'Connection error');
        }
    }
);

export const fetchImageProducts = createAsyncThunk(
    'image/fetchImageProducts',
    async (id, { rejectWithValue }) => {
        try {
            const url = `${API}/api/productImage/${id}`;
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const base64String = arrayBufferToBase64(response.data);
            console.log(`Image fetched from ${url}`);
            return base64String;
        } catch (error) {
            console.error(`Error fetching image from ${url}`, error);
            return rejectWithValue(error.response?.data || error.message || 'Connection error');
        }
    }
);

export const fetchImageQrcode = createAsyncThunk(
    'image/fetchImageQrcode',
    async (id, { rejectWithValue }) => {
        try {
            const url = `${API}/api/qrCodeImage/${id}`;
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const base64String = arrayBufferToBase64(response.data);
            console.log(`Image fetched from ${url}`);
            return base64String;
        } catch (error) {
            console.error(`Error fetching image from ${url}`, error);
            return rejectWithValue(error.response?.data || error.message || 'Connection error');
        }
    }
);



// Slice
const stockSlice = createSlice({
    name: 'stock',
    initialState: {
        data: [],
        image_products: {},
        image_qrcodes: {},
        loadingData: false,
        loadingImages: false,
        error: null,
    },
    reducers: {
        setData: (state, action) => {
            state.data = action.payload;
        },
        setImageProducts: (state, action) => {
            state.image_products[action.payload.id] = action.payload.image;
        },
        setImageQrcodes: (state, action) => {
            state.image_qrcodes[action.payload.id] = action.payload.image;
        }
    },
    extraReducers: (builder) => {
        builder
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
        .addCase(fetchImageProducts.pending, (state) => {
            state.loadingImages = true;
            state.error = null;
        })
        .addCase(fetchImageProducts.fulfilled, (state, action) => {
            state.loadingImages = false;
            state.image_products = action.payload; 
        })
        .addCase(fetchImageProducts.rejected, (state, action) => {
            state.loadingImages = false;
            state.error = action.payload || 'Failed to fetch image';
        })
        .addCase(fetchImageQrcode.pending, (state) => {
            state.loadingImages = true;
            state.error = null;
        })
        .addCase(fetchImageQrcode.fulfilled, (state, action) => {
            state.loadingImages = false;
            state.image_qrcodes = action.payload; 
        })
        .addCase(fetchImageQrcode.rejected, (state, action) => {
            state.loadingImages = false;
            state.error = action.payload || 'Failed to fetch image';
        });
    }    
});

export const { setData, setImageProducts, setImageQrcodes} = stockSlice.actions;

// Selectors
export const selectData = (state) => state.stock.data;
export const selectImageProducts = (state) => state.stock.image_products;
export const selectImageQrcodes = (state) => state.stock.image_qrcodes;


export default stockSlice.reducer;
