import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type VehicleType = "4W" | "2W";
export type CoverageType = "Comprehensive" | "ThirdParty";

export interface VehicleModel {
  id: string;
  model: string;
  variant: string;
  fuel: string;
  cubicCapacity: string;
  carryingCapacity: string;
  vehicleCode: string;
  // extra fields from API
  vehicleMake: string;
  vehicleMakeCode: string;
  vehicleModelCode: string;
  vehicleSubtype: string;
  vehicleSubtypeCode: string;
  vehicleType: string;
}

export interface UserDetails {
  registrationNo: string;
  registrationDate: string;
  registrationLocation: string;
  yearOfManufacture: string;
  contactNumber: string;
  city: string;
}

export interface PremiumSummaryItem {
  paramdesc: string;
  paramref: string;
  paramtype: string;
  od: string;
  act: string;
  net: string;
}

export interface PremiumDetails {
  ncbamt: string;
  addloadprem: string;
  totalodpremium: string;
  totalactpremium: string;
  totalnetpremium: string;
  totalpremium: string;
  netpremium: string;
  finalpremium: string;
  spdisc: string;
  servicetax: string;
  stampduty: string;
  collpremium: string;
  imtout: string;
  totaliev: string;
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

export interface KycResponse {
  data: Record<string, unknown>;
  message: string;
  success: boolean;
}

export interface KycFormValues {
  dob: string;
  location_code: string;
  customer_type: string;
  product_code: string;
  transaction_id: string;
}

interface InsuranceState {
  selectedVehicleType: VehicleType | null;
  coverageType: CoverageType;
  selectedBrand: string | null;
  selectedVehicle: VehicleModel | null;
  userDetails: UserDetails | null;
  premiumResponse: PremiumDetails | null;
  premiumSummary: PremiumSummaryItem[];
  transactionId: string | null;
  apiBrands: string[];
  apiModels: VehicleFromMakeItem[];
  loading: boolean;
  error: string | null;
  kycResponse: KycResponse | null;
  kycFormValues: KycFormValues | null;
}

const initialState: InsuranceState = {
  selectedVehicleType: null,
  coverageType: "Comprehensive",
  selectedBrand: null,
  selectedVehicle: null,
  userDetails: null,
  premiumResponse: null,
  premiumSummary: [],
  transactionId: null,
  apiBrands: [],
  apiModels: [],
  loading: false,
  error: null,
  kycResponse: null,
  kycFormValues: null,
};

const insuranceSlice = createSlice({
  name: "insurance",
  initialState,
  reducers: {
    setVehicleType(state, action: PayloadAction<VehicleType>) {
      if (state.selectedVehicleType !== action.payload) {
        state.selectedBrand = null;
        state.selectedVehicle = null;
        state.premiumResponse = null;
        state.premiumSummary = [];
        state.userDetails = null;
      }
      state.selectedVehicleType = action.payload;
    },
    setBrand(state, action: PayloadAction<string>) {
      if (state.selectedBrand !== action.payload) {
        state.selectedVehicle = null;
        state.premiumResponse = null;
        state.premiumSummary = [];
        state.apiModels = [];
        state.userDetails = null;
      }
      state.selectedBrand = action.payload;
    },
    setVehicle(state, action: PayloadAction<VehicleModel>) {
      state.selectedVehicle = action.payload;
      state.premiumResponse = null;
      state.premiumSummary = [];
      state.userDetails = null;
    },
    setUserDetails(state, action: PayloadAction<UserDetails>) {
      state.userDetails = action.payload;
    },
    setPremium(
      state,
      action: PayloadAction<{ details: PremiumDetails; summary: PremiumSummaryItem[]; transactionId: string }>,
    ) {
      state.premiumResponse = action.payload.details;
      state.premiumSummary = action.payload.summary;
      state.transactionId = action.payload.transactionId;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setKycResponse(state, action: PayloadAction<KycResponse | null>) {
      state.kycResponse = action.payload;
    },
    setKycFormValues(state, action: PayloadAction<KycFormValues | null>) {
      state.kycFormValues = action.payload;
    },
    setApiBrands(state, action: PayloadAction<string[]>) {
      state.apiBrands = action.payload;
    },
    setApiModels(state, action: PayloadAction<VehicleFromMakeItem[]>) {
      state.apiModels = action.payload;
    },
    resetFlow(state) {
      state.selectedBrand = null;
      state.selectedVehicle = null;
      state.premiumResponse = null;
      state.premiumSummary = [];
      state.userDetails = null;
      state.transactionId = null;
      state.apiBrands = [];
      state.apiModels = [];
      state.error = null;
      state.kycResponse = null;
      state.kycFormValues = null;
    },
  },
});

export const {
  setVehicleType,
  setBrand,
  setVehicle,
  setUserDetails,
  setPremium,
  setLoading,
  setError,
  setKycResponse,
  setKycFormValues,
  setApiBrands,
  setApiModels,
  resetFlow,
} = insuranceSlice.actions;

export default insuranceSlice.reducer;
