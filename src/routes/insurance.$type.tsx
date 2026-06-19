import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Search, CheckCircle2, RotateCw } from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { Stepper } from "@/components/Stepper";
import { CountUp } from "@/components/CountUp";
import { useAppDispatch, useAppSelector } from "@/store";

import {
  setBrand,
  setVehicle,
  setVehicleType,
  setPremium,
  setApiBrands,
  setApiModels,
  type VehicleModel,
} from "@/features/insurance/insuranceSlice";

import { FALLBACK_PREMIUM, useCalculatePremiumMutation } from "@/services/policyApi";
import { useGetVehiclesFromMakeQuery, useGetVehicleMakesQuery} from "@/services/vehicleAPI";
import { useStrings } from "@/i18n/strings";

export const Route = createFileRoute("/insurance/$type")({
  parseParams: ({ type }) => {
    const lower = type.toLowerCase();
    if (lower !== "4w" && lower !== "2w"  && lower !== "6w") throw notFound();
    return { type: lower as "4w" | "2w" };
  },
  validateSearch: (search: Record<string, unknown>) => ({
    product_code: search.product_code as string | number | undefined,
  }),
  head: ({ params }) => ({
    meta: [
      {
        title:
          params.type === "4w"
            ? "Four Wheeler Insurance — Leads Insurance Broker"
            : "Two Wheeler Insurance — Leads Insurance Broker",
      },
      {
        name: "description",
        content: "Select your vehicle, calculate premium and buy your motor policy instantly.",
      },
    ],
  }),
  component: InsuranceFlow,
});

function InsuranceFlow() {
  const { type } = Route.useParams();
  const { product_code } = Route.useSearch();

  const vt = type.toUpperCase() as "4W" | "2W";
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const insurance = useAppSelector((s) => s.insurance);
  const t = useStrings(useAppSelector((s) => s.language.selectedLanguages));

  const [step, setStep] = useState(1);

  useEffect(() => {
    dispatch(setVehicleType(vt));
  }, [vt, dispatch]);

  // Step 1: fetch vehicle makes using product_code from search params
  const { data: makesData, isLoading: makesLoading } = useGetVehicleMakesQuery(
    { product_code: product_code! },
    { skip: !product_code },
  );

  // Step 2: fetch models once a brand is selected
  const { data: modelsData, isLoading: modelsLoading } = useGetVehiclesFromMakeQuery(
    { product_code: product_code!, vehicle_make: insurance.selectedBrand! },
    { skip: !product_code || !insurance.selectedBrand },
  );

  // Sync API responses into Redux
  useEffect(() => {
    if (makesData?.data) dispatch(setApiBrands(makesData.data));
  }, [makesData, dispatch]);

  useEffect(() => {
    if (modelsData?.data) dispatch(setApiModels(modelsData.data));
  }, [modelsData, dispatch]);

  useEffect(() => {
    if (step === 2 && !insurance.selectedBrand) setStep(1);
    if (step === 3 && !insurance.selectedVehicle) setStep(insurance.selectedBrand ? 2 : 1);
  }, [step, insurance.selectedBrand, insurance.selectedVehicle]);

  const labels = [t.selectBrand, t.selectModel, t.calcPremium];

  return (
    <div className="relative min-h-screen pb-32">
      <TopBar />
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : navigate({ to: "/" }))}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:scale-[1.02]"
          >
            <ArrowLeft className="h-4 w-4" /> {t.back}
          </button>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {vt === "4W" ? "Four Wheeler" : "Two Wheeler"} • Comprehensive
          </div>
        </div>

        <div className="mt-6">
          <Stepper step={step} labels={labels} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35 }}
            className="mt-10"
          >
            {step === 1 && <Step1 vt={vt} isLoading={makesLoading} onNext={() => setStep(2)} />}
            {step === 2 && <Step2 vt={vt} isLoading={modelsLoading} onNext={() => setStep(3)} />}
            {step === 3 && <Step3 />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- Step 1 — Brand ---------------- */

function Step1({ vt, isLoading, onNext }: { vt: "4W" | "2W"; isLoading: boolean; onNext: () => void }) {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.insurance.selectedBrand);
  const brands = useAppSelector((s) => s.insurance.apiBrands);
  const t = useStrings(useAppSelector((s) => s.language.selectedLanguages));
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => brands.filter((b) => b.toLowerCase().includes(q.toLowerCase())),
    [brands, q],
  );

  return (
    <div className="glass mx-auto max-w-3xl rounded-2xl p-4 sm:p-6 " >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold sm:text-xl">{t.selectBrand}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pick the manufacturer of your vehicle.
          </p>
        </div>
        {selected && (
          <span className="rounded-full bg-[var(--brand)]/10 px-2.5 py-1 text-xs font-medium text-[var(--brand)]">
            {selected}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchBrand}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)]/60 py-2.5 pl-9 pr-3 text-sm outline-none ring-[var(--ring)] transition focus:ring-2"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--muted)]" />
          ))}
        </div>
      ) : (
        <div className="mt-4 max-h-[380px] overflow-y-auto pr-1">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {filtered.map((b) => {
            const active = selected === b;
            return (
              <motion.button
                key={b}
                whileTap={{ scale: 0.96 }}
                onClick={() => dispatch(setBrand(b))}
                className={`relative flex h-14 items-center justify-center rounded-xl border px-2 text-center transition ${
                  active
                    ? "border-transparent bg-[var(--brand)] text-[var(--primary-foreground)] shadow-sm"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--brand)]/50 hover:bg-[var(--brand)]/5"
                }`}
              >
                <span className="line-clamp-2 font-display text-xs font-semibold leading-tight">
                  {b}
                </span>
                {active && (
                  <CheckCircle2
                    className="absolute right-1 top-1 h-3.5 w-3.5"
                    strokeWidth={2.5}
                  />
                )}
              </motion.button>
            );
          })}
          {filtered.length === 0 && !isLoading && (
            <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
              No brands match "{q}".
            </div>
          )}
        </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex justify-end">
        <button
          disabled={!selected}
          onClick={onNext}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Step 2 — Model ---------------- */

function Step2({ vt, isLoading, onNext }: { vt: "4W" | "2W"; isLoading: boolean; onNext: () => void }) {
  const dispatch = useAppDispatch();
  const brand = useAppSelector((s) => s.insurance.selectedBrand);
  const selected = useAppSelector((s) => s.insurance.selectedVehicle);
  const models = useAppSelector((s) => s.insurance.apiModels);
  const selectedVehicle = useAppSelector((s) => s.insurance.selectedVehicle);

  const t = useStrings(useAppSelector((s) => s.language.selectedLanguages));
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      models.filter((m) =>
        `${m.vehiclemodel} ${m.vehiclesubtype} ${m.fuel}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [models, q],
  );

  console.log(filtered)


  const fuelLabel = (code: string) => {
    const map: Record<string, string> = { P: "Petrol", D: "Diesel", E: "Electric", C: "CNG", H: "Hybrid" };
    return map[code?.toUpperCase()] ?? code;
  };

  return (
    <div className="glass mx-auto max-w-5xl rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{t.selectModel}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Brand: <span className="font-semibold text-foreground">{brand}</span></p>
        </div>
        {selected && (
          <div className="text-xs text-[var(--brand)]">
            1 selected
          </div>
        )}
      </div>

      <div className="relative mt-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search model or variant…"
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)]/60 py-3 pl-11 pr-4 text-sm outline-none ring-[var(--ring)] focus:ring-2"
        />
      </div>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-[var(--muted)]" />
          ))}
        </div>
      ) : (
        <div className="mt-6 max-h-[420px] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((m) => {
            const active = selected?.vehicleCode === m.vehiclecode;
            console.log(m,"m")
            return (
              <motion.button
                key={m.vehiclecode}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  dispatch(
                    setVehicle({
                      id: m.vehiclecode,
                      model: m.vehiclemodel,
                      variant: m.vehiclesubtype,
                      fuel: fuelLabel(m.fuel),
                      cubicCapacity: m.cubiccapacity,
                      carryingCapacity: m.carryingcapacity,
                      vehicleCode: m.vehiclecode,
                      vehicleMake:m.vehiclemake,
                      vehicleMakeCode:m.vehiclemakecode,
                      vehicleModel:m.vehiclemodel,
                      vehicleModelCode:m.vehiclemodelcode,
                      vehiclesubtype:m.vehiclesubtype,
                      vehicleSubtypeCode:m.vehiclesubtypecode,
                      vehicleType:m.vehicletype,
                      registration_no:m.registration_no,
                      registrationDate:m.registration_date,
                      registrationLocation:m.registration_location,


                    }),
                  )
                }
                className={`relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-transparent bg-gradient-to-br from-[var(--brand)] to-[var(--brand-glow)] text-[var(--primary-foreground)] shadow-elegant"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--brand)]/50"
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-display text-base font-bold leading-tight">
                      {m.vehiclemodel}
                    </div>
                    <div className={`mt-0.5 truncate text-xs ${active ? "opacity-80" : "text-muted-foreground"}`}>
                      {m.vehiclesubtype}
                    </div>
                  </div>
                  {active && <CheckCircle2 className="h-5 w-5 shrink-0" strokeWidth={2.5} />}
                </div>

                {/* Stats row */}
                <div className={`mt-3 grid grid-cols-3 divide-x text-center text-xs ${active ? "divide-white/20" : "divide-[var(--border)]"}`}>
                  <div className="pr-2">
                    <div className={`font-semibold ${active ? "" : "text-foreground"}`}>
                      {fuelLabel(m.fuel)}
                    </div>
                    <div className={`mt-0.5 ${active ? "opacity-70" : "text-muted-foreground"}`}>Fuel</div>
                  </div>
                  <div className="px-2">
                    <div className={`font-semibold ${active ? "" : "text-foreground"}`}>
                      {m.cubiccapacity} cc
                    </div>
                    <div className={`mt-0.5 ${active ? "opacity-70" : "text-muted-foreground"}`}>Engine</div>
                  </div>
                  <div className="pl-2">
                    <div className={`font-semibold ${active ? "" : "text-foreground"}`}>
                      {m.carryingcapacity}
                    </div>
                    <div className={`mt-0.5 ${active ? "opacity-70" : "text-muted-foreground"}`}>Seats</div>
                  </div>
                </div>

                {/* Footer */}
                <div className={`mt-3 text-[10px] uppercase tracking-wider ${active ? "opacity-60" : "text-muted-foreground"}`}>
                  Code: {m.vehiclecode}
                </div>
              </motion.button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
              No models found.
            </div>
          )}
        </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          disabled={!selected}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-elegant transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.calcPremium} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
        active
          ? "bg-white/20 text-[var(--primary-foreground)]"
          : "bg-[var(--muted)] text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

/* ---------------- Step 3 — Premium ---------------- */

function Step3() {
  const dispatch = useAppDispatch();
  const insurance = useAppSelector((s) => s.insurance);
  const [calc, { isLoading, isError, data, reset }] = useCalculatePremiumMutation();

  const vehicle = insurance.selectedVehicle as VehicleModel;

  const run = () => {
    if (!vehicle || !insurance.selectedVehicleType) return;
    calc({
      vehicle_type: insurance.selectedVehicleType,
      coverage_type: "Comprehensive",
      brand: insurance.selectedBrand ?? undefined,
      model: vehicle.model,
      variant: vehicle.variant,
      vehicle_code: vehicle.vehicleCode,
    });
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use API data when available, otherwise fall back (the spec API is LAN-only).
  const premium =
    data?.premiumdetails ?? (isError ? FALLBACK_PREMIUM.premiumdetails : undefined);

  useEffect(() => {
    if (premium) dispatch(setPremium(premium));
  }, [premium, dispatch]);


  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.4fr]">
      {/* Vehicle summary */}
      <div className="glass rounded-3xl p-6">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--brand)]">
          Vehicle Summary
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold">
          {insurance.selectedBrand} {vehicle?.model}
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Field label="Variant" value={vehicle?.variant} />
          <Field label="Fuel" value={vehicle?.fuel} />
          <Field label="Capacity" value={vehicle?.cubicCapacity} />
          <Field label="Seating" value={vehicle?.carryingCapacity} />
          <Field label="Vehicle Code" value={vehicle?.vehicleCode} />
          <Field label="Coverage" value="Comprehensive" />
        </div>
      </div>

      {/* Premium dashboard */}
      <div className="glass rounded-3xl p-6 sm:p-8">
        {isLoading && <PremiumSkeleton />}
        {!isLoading && premium && <PremiumResult />}
        {!isLoading && !premium && (
          <ErrorState
            onRetry={() => {
              reset();
              run();
            }}
          />
        )}
      </div>
    </div>
  );
}


function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl bg-[var(--muted)]/60 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate font-medium">{value ?? "—"}</div>
    </div>
  );
}

function PremiumSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-32 rounded-full bg-[var(--muted)]" />
      <div className="h-8 w-2/3 rounded-full bg-[var(--muted)]" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-[var(--muted)]" />
        ))}
      </div>
      <div className="h-32 rounded-3xl bg-[var(--muted)]" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid place-items-center py-12 text-center">
      <div className="text-sm text-destructive">Couldn't calculate premium.</div>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]"
      >
        <RotateCw className="h-4 w-4" /> Retry
      </button>
    </div>
  );
}

function PremiumResult() {
  const premium = useAppSelector((s) => s.insurance.premiumResponse);
  const t = useStrings(useAppSelector((s) => s.language.selectedLanguages));
  if (!premium) return null;

  const final = parseInt(premium.finalpremium, 10);

  return (
    <>
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--brand)]">
        Premium Breakdown
      </div>
      <div className="mt-1 flex items-center gap-2 font-display text-2xl font-bold">
        Your quote is ready
        <CheckCircle2 className="h-5 w-5 text-[var(--brand)]" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Own Damage" value={`₹${fmt(premium.totalodpremium)}`} />
        <MetricCard label="Third Party" value={`₹${fmt(premium.totalactpremium)}`} />
        <MetricCard label="GST" value={`₹${fmt(premium.servicetax)}`} />
        <MetricCard label="IDV" value={`₹${fmt(premium.totaliev)}`} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-glow)] p-7 text-[var(--primary-foreground)] shadow-elegant"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="text-xs uppercase tracking-[0.18em] opacity-80">{t.finalPremium}</div>
        <div className="mt-1 font-display text-5xl font-bold sm:text-6xl">
          <CountUp value={final} prefix="₹" />
        </div>
        <div className="mt-2 text-xs opacity-80">Includes all taxes • 1 year policy</div>
      </motion.div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-[var(--muted)] px-2.5 py-1">Total Premium ₹{fmt(premium.totalpremium)}</span>
        <span className="rounded-full bg-[var(--muted)] px-2.5 py-1">Zero Depreciation Available</span>
        <span className="rounded-full bg-[var(--muted)] px-2.5 py-1">Cashless Garages: 6500+</span>
      </div>

      <BuyStickyCTA amount={final} />
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg font-bold">{value}</div>
    </div>
  );
}

function BuyStickyCTA({ amount }: { amount: number }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-5 pt-3 sm:px-6">
      <div className="glass-strong mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl p-3 pl-5 shadow-elegant">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Final Premium
          </div>
          <div className="font-display text-xl font-bold">₹{amount.toLocaleString("en-IN")}</div>
        </div>
        <button className="relative inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-elegant animate-pulse-ring">
          Buy Policy Now <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function fmt(n: string | number) {
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString("en-IN");
}
