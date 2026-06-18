import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Search, CheckCircle2, Loader2, RotateCw } from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { Stepper } from "@/components/Stepper";
import { CountUp } from "@/components/CountUp";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setBrand,
  setVehicle,
  setVehicleType,
  setPremium,
  type VehicleModel,
} from "@/features/insurance/insuranceSlice";
import { BRANDS_2W, BRANDS_4W, MODELS_2W, MODELS_4W } from "@/utils/vehicleData";
import { useCalculatePremiumMutation } from "@/services/policyApi";
import { useStrings } from "@/i18n/strings";

export const Route = createFileRoute("/insurance/$type")({
  parseParams: ({ type }) => {
    const lower = type.toLowerCase();
    if (lower !== "4w" && lower !== "2w") throw notFound();
    return { type: lower as "4w" | "2w" };
  },
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
  const vt = type.toUpperCase() as "4W" | "2W";
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const insurance = useAppSelector((s) => s.insurance);
  const t = useStrings(useAppSelector((s) => s.language.selectedLanguages));

  const [step, setStep] = useState(1);

  useEffect(() => {
    dispatch(setVehicleType(vt));
  }, [vt, dispatch]);

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
            {step === 1 && <Step1 vt={vt} onNext={() => setStep(2)} />}
            {step === 2 && <Step2 vt={vt} onNext={() => setStep(3)} />}
            {step === 3 && <Step3 />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- Step 1 — Brand ---------------- */

function Step1({ vt, onNext }: { vt: "4W" | "2W"; onNext: () => void }) {
  const brands = vt === "4W" ? BRANDS_4W : BRANDS_2W;
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.insurance.selectedBrand);
  const t = useStrings(useAppSelector((s) => s.language.selectedLanguages));
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => brands.filter((b) => b.toLowerCase().includes(q.toLowerCase())),
    [brands, q],
  );

  return (
    <div className="glass mx-auto max-w-5xl rounded-3xl p-6 sm:p-8">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">{t.selectBrand}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick the manufacturer of your vehicle.
      </p>

      <div className="relative mt-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchBrand}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)]/60 py-3 pl-11 pr-4 text-sm outline-none ring-[var(--ring)] focus:ring-2"
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((b) => {
          const active = selected === b;
          return (
            <motion.button
              key={b}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => dispatch(setBrand(b))}
              className={`relative overflow-hidden rounded-2xl border p-5 text-left transition ${
                active
                  ? "border-transparent bg-gradient-to-br from-[var(--brand)] to-[var(--brand-glow)] text-[var(--primary-foreground)] shadow-elegant"
                  : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--brand)]/50"
              }`}
            >
              <div className="text-xs uppercase tracking-wider opacity-70">Brand</div>
              <div className="mt-1 line-clamp-2 font-display text-base font-semibold">{b}</div>
              {active && (
                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5" strokeWidth={2.5} />
              )}
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
            No brands match "{q}".
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          disabled={!selected}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-elegant transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Step 2 — Model ---------------- */

function Step2({ vt, onNext }: { vt: "4W" | "2W"; onNext: () => void }) {
  const dispatch = useAppDispatch();
  const brand = useAppSelector((s) => s.insurance.selectedBrand);
  const selected = useAppSelector((s) => s.insurance.selectedVehicle);
  const t = useStrings(useAppSelector((s) => s.language.selectedLanguages));
  const models = (vt === "4W" ? MODELS_4W : MODELS_2W)[brand ?? ""] ?? [];
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      models.filter((m) =>
        `${m.model} ${m.variant} ${m.fuel}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [models, q],
  );

  return (
    <div className="glass mx-auto max-w-5xl rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{t.selectModel}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Brand: {brand}</p>
        </div>
      </div>

      <div className="relative mt-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchModel}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)]/60 py-3 pl-11 pr-4 text-sm outline-none ring-[var(--ring)] focus:ring-2"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => {
          const active = selected?.id === m.id;
          return (
            <motion.button
              key={m.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch(setVehicle(m))}
              className={`relative overflow-hidden rounded-2xl border p-5 text-left transition ${
                active
                  ? "border-transparent bg-gradient-to-br from-[var(--brand)] to-[var(--brand-glow)] text-[var(--primary-foreground)] shadow-elegant"
                  : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--brand)]/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-lg font-bold leading-tight">{m.model}</div>
                  <div className="mt-0.5 text-xs uppercase tracking-wider opacity-80">
                    {m.variant}
                  </div>
                </div>
                {active && <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Pill active={active}>{m.fuel}</Pill>
                <Pill active={active}>{m.cubicCapacity}</Pill>
                <Pill active={active}>{m.carryingCapacity}</Pill>
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
  const t = useStrings(useAppSelector((s) => s.language.selectedLanguages));
  const [calc, { isLoading, isError, data, reset }] = useCalculatePremiumMutation();

  const vehicle = insurance.selectedVehicle as VehicleModel;

  useEffect(() => {
    if (!vehicle || !insurance.selectedVehicleType) return;
    calc({
      vehicle_type: insurance.selectedVehicleType,
      coverage_type: "Comprehensive",
      brand: insurance.selectedBrand ?? undefined,
      model: vehicle.model,
      variant: vehicle.variant,
      vehicle_code: vehicle.vehicleCode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // RTK Query falls back via transformErrorResponse — read from data, else from error payload.
  const premium = data?.premiumdetails;
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
        {!isLoading && isError && !premium && (
          <ErrorState
            onRetry={() => {
              reset();
              calc({
                vehicle_type: insurance.selectedVehicleType ?? "4W",
                coverage_type: "Comprehensive",
                brand: insurance.selectedBrand ?? undefined,
                model: vehicle?.model,
                variant: vehicle?.variant,
                vehicle_code: vehicle?.vehicleCode,
              });
            }}
          />
        )}
        {premium && <PremiumResult />}
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

// Loader is needed to keep TS happy with unused imports
void Loader2;
