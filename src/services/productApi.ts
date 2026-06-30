import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { VehicleType } from "@/features/insurance/insuranceSlice";

export interface Product {
  product_code: string | number;
  vehicle_type: VehicleType;
  coverage_type: string;
}

export interface ProductsResponse {
  data: Product[];
}

export const productApi = createApi({
  reducerPath: "ProductApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://43.205.144.104/api",
  }),
  endpoints: (builder) => ({
    fetchProducts: builder.query<ProductsResponse, void>({
      query: () => ({
        url: "/products",
        method: "GET",
      }),
    }),
  }),
});

export const { useFetchProductsQuery } = productApi;