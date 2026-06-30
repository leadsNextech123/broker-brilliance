import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PremiumDetails, PremiumSummaryItem } from "@/features/insurance/insuranceSlice";

export interface CalculatePremiumPayload {
  vehicle_code: string;
  city: string;
  contact_number: string;
  weo_mot_policyin: {
    pol_type: number;
    product_4_digitcode: string | number;
    branch_code: number;
    term_start_date: string;
    term_end_date: string;
    vehicle_type_code: string;
    vehicle_type: string;
    vehicle_make_code: string;
    vehicle_make: string;
    vehicle_model_code: string;
    vehicle_model: string;
    vehicle_subtype_code: string;
    vehicle_subtype: string;
    fuel: string;
    registration_no: string;
    registration_date: string;
    registration_location: string;
    regi_loc_other: string;
    carrying_capacity: string;
    cubic_capacity: string;
    year_manf: string;
    vehicle_idv: string;
  };
}

export interface CalculatePremiumResponse {
  success: boolean;
  message: string;
  data: {
    premiumdetails: PremiumDetails;
    premiumsummerylist: PremiumSummaryItem[];
    errorlist: unknown[];
    errorcode: number;
    transactionid: string;
  };
  timestamp: string;
}

export interface ValidateKycPayload {
  doc_type_code: string;
  doc_number: string;
  transaction_id: string;
  dob: string;
  product_code: string;
  sys_type: string;
  location_code: string;
  customer_type: string;
  insurance_type: string;
}

export interface ValidateKycResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export const policyApi = createApi({
  reducerPath: "policyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://43.205.144.104/api",
  }),
  endpoints: (builder) => ({
    calculatePremium: builder.mutation<CalculatePremiumResponse, CalculatePremiumPayload>({
      query: (body) => ({
        url: "/policy/calculate-premium",
        method: "POST",
        body,
      }),
    }),
    validateKyc: builder.mutation<ValidateKycResponse, ValidateKycPayload>({
      query: (body) => ({
        url: "/policy/validate-kyc-details",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCalculatePremiumMutation, useValidateKycMutation } = policyApi;
