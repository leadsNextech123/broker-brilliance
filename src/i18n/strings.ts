import type { LanguageCode } from "@/features/language/languageSlice";

export const STRINGS = {
  en: {
    name: "English",
    heroTitle: "Find the Right Insurance Policy in Minutes",
    heroSub: "Compare plans, calculate premiums and buy insurance instantly.",
    fourWheeler: "Four Wheeler Insurance",
    twoWheeler: "Two Wheeler Insurance",
    comprehensive: "Comprehensive Coverage",
    getQuote: "Get Quote",
    selectBrand: "Select Vehicle Brand",
    selectModel: "Select Vehicle Model",
    calcPremium: "Calculate Premium",
    validateKyc: "Validate KYC",
    uploadKycDoc: "Upload KYC Document",
    next: "Continue",
    back: "Back",
    searchBrand: "Search brands…",
    searchModel: "Search models…",
    buyNow: "Buy Policy Now",
    finalPremium: "Final Premium",
  },
  hi: {
    name: "हिंदी",
    heroTitle: "मिनटों में सही बीमा पॉलिसी चुनें",
    heroSub: "प्लान तुलना करें, प्रीमियम गणना करें और तुरंत बीमा खरीदें।",
    fourWheeler: "फोर व्हीलर बीमा",
    twoWheeler: "टू व्हीलर बीमा",
    comprehensive: "कॉम्प्रिहेंसिव कवरेज",
    getQuote: "कोटेशन लें",
    selectBrand: "वाहन ब्रांड चुनें",
    selectModel: "वाहन मॉडल चुनें",
    calcPremium: "प्रीमियम कैलकुलेट करें",
    validateKyc: "KYC सत्यापित करें",
    uploadKycDoc: "KYC दस्तावेज़ अपलोड करें",
    next: "आगे बढ़ें",
    back: "वापस",
    searchBrand: "ब्रांड खोजें…",
    searchModel: "मॉडल खोजें…",
    buyNow: "अभी पॉलिसी खरीदें",
    finalPremium: "अंतिम प्रीमियम",
  },
} as const;

export function useStrings(langs: LanguageCode[]) {
  const primary = langs[0] ?? "en";
  return STRINGS[primary];
}
