import { configureStore, combineReducers } from "@reduxjs/toolkit";
import stockSlice from "./stockSlice";

const rootReducer = combineReducers({
    stock: stockSlice
});


const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
});

export default store;