import { configureStore, combineReducers } from "@reduxjs/toolkit";
import stockSlice from "./stockSlice";

const rootReducer = combineReducers({
    stock: stockSlice
});


const store = configureStore({
    reducer: rootReducer
});

export default store;