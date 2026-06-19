import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PremiumDetails } from "@/features/insurance/insuranceSlice";

export interface CalculatePremiumPayload {
  vehicle_type: "4W" | "2W";
  coverage_type: "Comprehensive" | "ThirdParty";
  brand?: string;
  model?: string;
  variant?: string;
  vehicle_code?: string;
}

interface CalculatePremiumResponse {
  premiumdetails: PremiumDetails;
}

export const policyApi = createApi({
  reducerPath: "policyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://192.168.0.184:8888/api",
  }),
  endpoints: (builder) => ({
    calculatePremium: builder.mutation<CalculatePremiumResponse, CalculatePremiumPayload>({
      query: (body) => ({
        url: "/policy/calculate-premium",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const FALLBACK_PREMIUM: CalculatePremiumResponse = {
  premiumdetails: {
    totalodpremium: "11450",
    totalactpremium: "3747",
    totalpremium: "15197",
    finalpremium: "17933",
    servicetax: "2736",
    totaliev: "581295",
  },
};

export const { useCalculatePremiumMutation } = policyApi;
