import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type LanguageCode = "en" | "hi";

interface LanguageState {
  selectedLanguages: LanguageCode[];
}

const initialState: LanguageState = {
  selectedLanguages: ["en"],
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    toggleLanguage(state, action: PayloadAction<LanguageCode>) {
      const code = action.payload;
      if (state.selectedLanguages.includes(code)) {
        if (state.selectedLanguages.length > 1) {
          state.selectedLanguages = state.selectedLanguages.filter((c) => c !== code);
        }
      } else {
        state.selectedLanguages.push(code);
      }
    },
    setLanguages(state, action: PayloadAction<LanguageCode[]>) {
      state.selectedLanguages = action.payload.length ? action.payload : ["en"];
    },
  },
});

export const { toggleLanguage, setLanguages } = languageSlice.actions;
export default languageSlice.reducer;
