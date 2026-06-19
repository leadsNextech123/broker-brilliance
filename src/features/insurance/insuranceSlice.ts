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
}

export interface PremiumDetails {
  totalodpremium: string;
  totalactpremium: string;
  totalpremium: string;
  finalpremium: string;
  servicetax: string;
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

interface InsuranceState {
  selectedVehicleType: VehicleType | null;
  coverageType: CoverageType;
  selectedBrand: string | null;
  selectedVehicle: VehicleModel | null;
  premiumResponse: PremiumDetails | null;
  apiBrands: string[];
  apiModels: VehicleFromMakeItem[];
  loading: boolean;
  error: string | null;
}

const initialState: InsuranceState = {
  selectedVehicleType: null,
  coverageType: "Comprehensive",
  selectedBrand: null,
  selectedVehicle: null,
  premiumResponse: null,
  apiBrands: [],
  apiModels: [],
  loading: false,
  error: null,
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
      }
      state.selectedVehicleType = action.payload;
    },
    setBrand(state, action: PayloadAction<string>) {
      if (state.selectedBrand !== action.payload) {
        state.selectedVehicle = null;
        state.premiumResponse = null;
        state.apiModels = [];
      }
      state.selectedBrand = action.payload;
    },
    setVehicle(state, action: PayloadAction<VehicleModel>) {
      state.selectedVehicle = action.payload;
      state.premiumResponse = null;
    },
    setPremium(state, action: PayloadAction<PremiumDetails>) {
      state.premiumResponse = action.payload;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
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
      state.apiBrands = [];
      state.apiModels = [];
      state.error = null;
    },
  },
});

export const {
  setVehicleType,
  setBrand,
  setVehicle,
  setPremium,
  setLoading,
  setError,
  setApiBrands,
  setApiModels,
  resetFlow,
} = insuranceSlice.actions;

export default insuranceSlice.reducer;
