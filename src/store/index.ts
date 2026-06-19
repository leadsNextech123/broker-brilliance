import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import languageReducer from "@/features/language/languageSlice";
import insuranceReducer from "@/features/insurance/insuranceSlice";
import { policyApi } from "@/services/policyApi";
import {productApi} from "@/services/productApi"
import { vehicleMakeApi } from "@/services/vehicleAPI";

export const store = configureStore({
  reducer: {
    language: languageReducer,
    insurance: insuranceReducer,
    [policyApi.reducerPath]: policyApi.reducer,
    [productApi.reducerPath]:productApi.reducer,
    [vehicleMakeApi.reducerPath]: vehicleMakeApi.reducer
  },
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware()
    .concat(policyApi.middleware)
    .concat(productApi.middleware)
    .concat(vehicleMakeApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

