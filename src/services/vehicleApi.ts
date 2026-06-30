import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface VehicleMakeResponse {
  data: string[];
}

export interface VehicleFromMakeItem {
  vehiclecode: string;
  vehicletype: string;
  vehiclemakecode: string;
  vehiclemake: string;
  vehiclemodelcode: string;
  vehiclemodel: string;
  vehiclesubtypecode: string;
  vehiclesubtype: string;
  fuel: string;
  cubiccapacity: string;
  carryingcapacity: string;
}

export interface VehicleFromMakeResponse {
  data: VehicleFromMakeItem[];
}

export const vehicleMakeApi = createApi({
  reducerPath: "vehicleMakeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://43.205.144.104/api",
  }),
  endpoints: (builder) => ({
    getVehicleMakes: builder.query<VehicleMakeResponse, { product_code: string | number }>({
      query: ({ product_code }) => ({
        url: "/policy/vehicle-make",
        method: "GET",
        params: { product_code },
      }),
    }),
    getVehiclesFromMake: builder.query<
      VehicleFromMakeResponse,
      { product_code: string | number; vehicle_make: string }
    >({
      query: ({ product_code, vehicle_make }) => ({
        url: "/policy/vehicles-from-make",
        method: "GET",
        params: { product_code, vehicle_make },
      }),
    }),
  }),
});

export const { useGetVehiclesFromMakeQuery, useGetVehicleMakesQuery} = vehicleMakeApi;

