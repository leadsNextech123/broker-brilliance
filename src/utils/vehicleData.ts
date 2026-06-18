import type { VehicleModel } from "@/features/insurance/insuranceSlice";

export const BRANDS_4W = [
  "DAEWOO",
  "FIAT",
  "FORD",
  "HINDUSTAN",
  "HONDA",
  "HYUNDAI",
  "MAHINDRA AND MAHINDRA",
  "MARUTI",
];

export const BRANDS_2W = [
  "BAJAJ",
  "HERO",
  "HONDA",
  "ROYAL ENFIELD",
  "SUZUKI",
  "TVS",
  "YAMAHA",
  "KTM",
];

const fuels = ["Petrol", "Diesel", "CNG"];

function gen(
  brand: string,
  models: Array<{ model: string; variant: string; cc: string; seats: string; fuel?: string }>,
): VehicleModel[] {
  return models.map((m, i) => ({
    id: `${brand}-${m.model}-${m.variant}-${i}`,
    model: m.model,
    variant: m.variant,
    fuel: m.fuel ?? fuels[i % fuels.length],
    cubicCapacity: m.cc,
    carryingCapacity: m.seats,
    vehicleCode: `${brand.slice(0, 3).toUpperCase()}${1000 + i}`,
  }));
}

export const MODELS_4W: Record<string, VehicleModel[]> = {
  DAEWOO: gen("DAEWOO", [
    { model: "MATIZ", variant: "STD", cc: "796 CC", seats: "5 Seater" },
    { model: "CIELO", variant: "GLE", cc: "1498 CC", seats: "5 Seater" },
  ]),
  FIAT: gen("FIAT", [
    { model: "PUNTO", variant: "EMOTION", cc: "1248 CC", seats: "5 Seater" },
    { model: "LINEA", variant: "DYNAMIC", cc: "1368 CC", seats: "5 Seater" },
  ]),
  FORD: gen("FORD", [
    { model: "ASPIRE", variant: "STD", cc: "1196 CC", seats: "5 Seater" },
    { model: "ECOSPORT", variant: "TITANIUM", cc: "1496 CC", seats: "5 Seater" },
    { model: "FIGO", variant: "ZXI", cc: "1196 CC", seats: "5 Seater" },
  ]),
  HINDUSTAN: gen("HINDUSTAN", [
    { model: "AMBASSADOR", variant: "GRAND", cc: "1995 CC", seats: "5 Seater" },
  ]),
  HONDA: gen("HONDA", [
    { model: "CITY", variant: "VX", cc: "1497 CC", seats: "5 Seater" },
    { model: "AMAZE", variant: "S", cc: "1199 CC", seats: "5 Seater" },
    { model: "JAZZ", variant: "VX", cc: "1199 CC", seats: "5 Seater" },
  ]),
  HYUNDAI: gen("HYUNDAI", [
    { model: "i20", variant: "SPORTZ", cc: "1197 CC", seats: "5 Seater" },
    { model: "CRETA", variant: "SX", cc: "1497 CC", seats: "5 Seater" },
    { model: "VERNA", variant: "SX(O)", cc: "1497 CC", seats: "5 Seater" },
  ]),
  "MAHINDRA AND MAHINDRA": gen("MAHINDRA", [
    { model: "XUV500", variant: "W11", cc: "2179 CC", seats: "7 Seater" },
    { model: "SCORPIO", variant: "S11", cc: "2179 CC", seats: "7 Seater" },
    { model: "THAR", variant: "LX", cc: "2184 CC", seats: "4 Seater" },
  ]),
  MARUTI: gen("MARUTI", [
    { model: "SWIFT", variant: "ZXI", cc: "1197 CC", seats: "5 Seater" },
    { model: "BALENO", variant: "ALPHA", cc: "1197 CC", seats: "5 Seater" },
    { model: "BREZZA", variant: "ZXI", cc: "1462 CC", seats: "5 Seater" },
    { model: "WAGON R", variant: "VXI", cc: "1197 CC", seats: "5 Seater" },
  ]),
};

export const MODELS_2W: Record<string, VehicleModel[]> = {
  BAJAJ: gen("BAJAJ", [
    { model: "AVENGER 150", variant: "STREET", cc: "150 CC", seats: "2 Seater", fuel: "Petrol" },
    { model: "PULSAR 220", variant: "F", cc: "220 CC", seats: "2 Seater", fuel: "Petrol" },
  ]),
  HERO: gen("HERO", [
    { model: "SPLENDOR PLUS", variant: "STD", cc: "97 CC", seats: "2 Seater", fuel: "Petrol" },
    { model: "PASSION PRO", variant: "DRUM", cc: "113 CC", seats: "2 Seater", fuel: "Petrol" },
  ]),
  HONDA: gen("HONDA-2W", [
    { model: "ACTIVA 6G", variant: "STD", cc: "110 CC", seats: "2 Seater", fuel: "Petrol" },
    { model: "SHINE", variant: "DRUM", cc: "125 CC", seats: "2 Seater", fuel: "Petrol" },
  ]),
  "ROYAL ENFIELD": gen("RE", [
    { model: "CLASSIC 350", variant: "DUAL CHANNEL", cc: "349 CC", seats: "2 Seater", fuel: "Petrol" },
    { model: "METEOR 350", variant: "STELLAR", cc: "349 CC", seats: "2 Seater", fuel: "Petrol" },
  ]),
  SUZUKI: gen("SUZUKI", [
    { model: "ACCESS 125", variant: "STD", cc: "124 CC", seats: "2 Seater", fuel: "Petrol" },
    { model: "GIXXER", variant: "SF", cc: "155 CC", seats: "2 Seater", fuel: "Petrol" },
  ]),
  TVS: gen("TVS", [
    { model: "APACHE RTR 160", variant: "4V", cc: "159 CC", seats: "2 Seater", fuel: "Petrol" },
    { model: "JUPITER", variant: "ZX", cc: "109 CC", seats: "2 Seater", fuel: "Petrol" },
  ]),
  YAMAHA: gen("YAMAHA", [
    { model: "FZ-S", variant: "V3", cc: "149 CC", seats: "2 Seater", fuel: "Petrol" },
    { model: "MT-15", variant: "STD", cc: "155 CC", seats: "2 Seater", fuel: "Petrol" },
  ]),
  KTM: gen("KTM", [
    { model: "DUKE 200", variant: "STD", cc: "199 CC", seats: "2 Seater", fuel: "Petrol" },
    { model: "RC 390", variant: "STD", cc: "373 CC", seats: "2 Seater", fuel: "Petrol" },
  ]),
};
