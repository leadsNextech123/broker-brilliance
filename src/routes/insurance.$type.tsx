import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Search, CheckCircle2, RotateCw, FileText, TrendingDown, CalendarIcon, ShieldCheck, Loader2 } from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { Stepper } from "@/components/Stepper";
import { CountUp } from "@/components/CountUp";
import { useAppDispatch, useAppSelector } from "@/store";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import {
  setBrand,
  setVehicle,
  setVehicleType,
  setPremium,
  setUserDetails,
  setKycResponse,
  setKycFormValues,
  setApiBrands,
  setApiModels,
  type VehicleModel,
  type UserDetails,
} from "@/features/insurance/insuranceSlice";

import { useCalculatePremiumMutation, useValidateKycMutation, useUploadKycDocumentMutation } from "@/services/policyApi";
import { useGetVehiclesFromMakeQuery, useGetVehicleMakesQuery } from "@/services/vehicleAPI";
import { useStrings } from "@/i18n/strings";
import { toast } from "sonner";

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

  const labels = [t.selectBrand, t.selectModel, t.calcPremium, t.validateKyc, t.uploadKycDoc];

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
            {step === 3 && <Step3 onNext={() => setStep(4)} />}
            {step === 4 && <Step4 productCode={String(product_code ?? "")} onNext={() => setStep(5)} />}
            {step === 5 && <Step5 productCode={String(product_code ?? "")} />}
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
          onClick={() => {
            toast.success(`Brand selected: ${selected}`, { description: "Proceed to choose your model." });
            onNext();
          }}
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
                      vehicleMake: m.vehiclemake,
                      vehicleMakeCode: m.vehiclemakecode,
                      vehicleModelCode: m.vehiclemodelcode,
                      vehicleSubtype: m.vehiclesubtype,
                      vehicleSubtypeCode: m.vehiclesubtypecode,
                      vehicleType: m.vehicletype,
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
          onClick={() => {
            toast.success(`Vehicle selected: ${selected?.model}`, { description: selected?.vehicleSubtype ?? undefined });
            onNext();
          }}
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

/* ---------------- Step 3 — Details + Premium ---------------- */

function Step3({ onNext }: { onNext: () => void }) {
  const dispatch = useAppDispatch();
  const insurance = useAppSelector((s) => s.insurance);
  const { product_code } = Route.useSearch();
  const vehicle = insurance.selectedVehicle as VehicleModel;
  const [calc, { isLoading, data, reset }] = useCalculatePremiumMutation();
  const [submitted, setSubmitted] = useState(false);

  const today = new Date();
  const oneYearLater = new Date(today);
  oneYearLater.setFullYear(today.getFullYear() + 1);
  const fmtDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}-${d.toLocaleString("en-US", { month: "short" })}-${d.getFullYear()}`;

  const [form, setForm] = useState({
    registrationNo: "MH14SU7769",
    registrationDate: "01-Mar-2026",
    registrationLocation: "MUMBAI",
    city: "MUMBAI",
    yearOfManufacture: "2026",
    contactNumber: "8130222583",
  });
  
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.registrationNo.trim()) e.registrationNo = "Required";
    if (!form.registrationDate.trim()) e.registrationDate = "Required";
    if (!form.registrationLocation.trim()) e.registrationLocation = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.contactNumber.trim()) e.contactNumber = "Required";
    else if (!/^\d{10}$/.test(form.contactNumber)) e.contactNumber = "Must be 10 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !vehicle) return;
    const ud: UserDetails = {
      registrationNo: form.registrationNo,
      registrationDate: form.registrationDate,
      registrationLocation: form.registrationLocation,
      city: form.city,
      yearOfManufacture: form.yearOfManufacture,
      contactNumber: form.contactNumber,
    };
    dispatch(setUserDetails(ud));
    setSubmitted(true);
    calc({
      vehicle_code: vehicle.vehicleCode,
      city: form.city,
      contact_number: form.contactNumber,
      weo_mot_policyin: {
        pol_type: 3,
        product_4_digitcode: product_code ?? "",
        branch_code: 1933,
        term_start_date: fmtDate(today),
        term_end_date: fmtDate(oneYearLater),
        vehicle_type_code: vehicle.id,
        vehicle_type: vehicle.vehicleType,
        vehicle_make_code: vehicle.vehicleMakeCode,
        vehicle_make: vehicle.vehicleMake,
        vehicle_model_code: vehicle.vehicleModelCode,
        vehicle_model: vehicle.model,
        vehicle_subtype_code: vehicle.vehicleSubtypeCode,
        vehicle_subtype: vehicle.vehicleSubtype,
        fuel: 'P',
        registration_no: form.registrationNo,
        registration_date: form.registrationDate,
        registration_location: form.registrationLocation,
        regi_loc_other: form.registrationLocation,
        carrying_capacity: vehicle.carryingCapacity,
        cubic_capacity: vehicle.cubicCapacity,
        year_manf: form.yearOfManufacture,
        vehicle_idv: "0",
      },
    });
  };

  useEffect(() => {
    if (data?.data) {
      dispatch(setPremium({
        details: data.data.premiumdetails,
        summary: data.data.premiumsummerylist,
        transactionId: data.data.transactionid,
      }));
      toast.success("Premium calculated successfully!", {
        description: `Final premium: ₹${parseInt(data.data.premiumdetails.finalpremium, 10).toLocaleString("en-IN")}`,
      });
    }
  }, [data, dispatch]);

  const premiumDetails = useAppSelector((s) => s.insurance.premiumResponse);
  const premiumSummary = useAppSelector((s) => s.insurance.premiumSummary);
  const transactionId = useAppSelector((s) => s.insurance.transactionId);

  if (!submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-[var(--brand)]/10 px-4 py-3">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-[var(--brand)]">Selected Vehicle</div>
              <div className="mt-0.5 truncate font-display text-base font-bold">
                {vehicle?.vehicleMake} {vehicle?.model}
              </div>
              <div className="text-xs text-muted-foreground">{vehicle?.vehicleSubtype} • {vehicle?.fuel}</div>
            </div>
          </div>
          <h2 className="font-display text-xl font-bold">Vehicle Details</h2>
          <p className="mt-1 text-sm text-muted-foreground">A few more details to calculate your premium.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <FormField label="Registration Number" placeholder="e.g. MH14SU7769" value={form.registrationNo} error={errors.registrationNo} onChange={(v) => setForm((f) => ({ ...f, registrationNo: v }))} />
            <FormField label="Registration Date" placeholder="e.g. 01-Mar-2026" value={form.registrationDate} error={errors.registrationDate} onChange={(v) => setForm((f) => ({ ...f, registrationDate: v }))} />
            <FormField label="Registration Location" placeholder="e.g. MUMBAI" value={form.registrationLocation} error={errors.registrationLocation} onChange={(v) => setForm((f) => ({ ...f, registrationLocation: v.toUpperCase() }))} />
            <FormField label="City" placeholder="e.g. MUMBAI" value={form.city} error={errors.city} onChange={(v) => setForm((f) => ({ ...f, city: v.toUpperCase() }))} />
            <FormField label="Year of Manufacture" placeholder="e.g. 2026" value={form.yearOfManufacture} error={errors.yearOfManufacture} onChange={(v) => setForm((f) => ({ ...f, yearOfManufacture: v }))} />
            <FormField label="Contact Number" placeholder="10-digit mobile number" value={form.contactNumber} error={errors.contactNumber} onChange={(v) => setForm((f) => ({ ...f, contactNumber: v }))} />
          </div>
          <div className="mt-8 flex justify-end">
            <button onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-elegant transition hover:scale-[1.02]">
              Calculate Premium <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="mx-auto max-w-4xl"><div className="glass rounded-3xl p-8"><PremiumSkeleton /></div></div>;
  }

  if (!premiumDetails) {
    return <div className="mx-auto max-w-4xl"><div className="glass rounded-3xl p-8"><ErrorState onRetry={() => { reset(); setSubmitted(false); }} /></div></div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-32">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="glass rounded-3xl p-6">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--brand)]">Vehicle Summary</div>
          <h3 className="mt-2 font-display text-xl font-bold">{vehicle?.vehicleMake} {vehicle?.model}</h3>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <Field label="Variant" value={vehicle?.vehicleSubtype} />
            <Field label="Fuel" value={vehicle?.fuel} />
            <Field label="Engine" value={`${vehicle?.cubicCapacity} cc`} />
            <Field label="Seats" value={vehicle?.carryingCapacity} />
            <Field label="Reg. No." value={insurance.userDetails?.registrationNo} />
            <Field label="Reg. Date" value={insurance.userDetails?.registrationDate} />
            <Field label="Location" value={insurance.userDetails?.registrationLocation} />
            <Field label="Year Manf." value={insurance.userDetails?.yearOfManufacture} />
          </div>
          {transactionId && <div className="mt-3 text-[10px] text-muted-foreground">Txn: {transactionId}</div>}
        </div>

        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--brand)]">Premium Breakdown</div>
          <div className="mt-1 flex items-center gap-2 font-display text-xl font-bold">
            Your quote is ready <CheckCircle2 className="h-5 w-5 text-[var(--brand)]" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <MetricCard label="Own Damage" value={`₹${fmt(premiumDetails.totalodpremium)}`} />
            <MetricCard label="Third Party" value={`₹${fmt(premiumDetails.totalactpremium)}`} />
            <MetricCard label="GST" value={`₹${fmt(premiumDetails.servicetax)}`} />
            <MetricCard label="IDV" value={`₹${fmt(premiumDetails.totaliev)}`} />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="relative mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-glow)] p-6 text-[var(--primary-foreground)] shadow-elegant"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <div className="text-xs uppercase tracking-[0.18em] opacity-80">Final Premium</div>
            <div className="mt-1 font-display text-5xl font-bold">
              <CountUp value={parseInt(premiumDetails.finalpremium, 10)} prefix="₹" />
            </div>
            <div className="mt-2 text-xs opacity-80">Includes all taxes • 1 year policy</div>
          </motion.div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-[var(--muted)] px-2.5 py-1">Net ₹{fmt(premiumDetails.totalpremium)}</span>
            <span className="rounded-full bg-[var(--muted)] px-2.5 py-1">Stamp ₹{fmt(premiumDetails.stampduty)}</span>
          </div>
        </div>
      </div>

      {premiumSummary.length > 0 && (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-[var(--brand)]" /> Premium Summary
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Description</th>
                  <th className="pb-2 pr-4 text-right font-medium">OD (₹)</th>
                  <th className="pb-2 pr-4 text-right font-medium">TP (₹)</th>
                  <th className="pb-2 text-right font-medium">Net (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {premiumSummary.map((item, i) => {
                  const isDiscount = parseFloat(item.od) < 0 || item.paramref === "COMMDISC";
                  return (
                    <tr key={i} className={isDiscount ? "text-emerald-600 dark:text-emerald-400" : ""}>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          {isDiscount && <TrendingDown className="h-3 w-3" />}
                          {item.paramdesc}
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-right font-medium">{item.od !== "0" ? fmt(parseFloat(item.od)) : "—"}</td>
                      <td className="py-2.5 pr-4 text-right font-medium">{item.act !== "0" ? fmt(parseFloat(item.act)) : "—"}</td>
                      <td className="py-2.5 text-right font-medium">{item.net !== "0" ? fmt(parseFloat(item.net)) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BuyStickyCTA amount={parseInt(premiumDetails.finalpremium, 10)} onProceedKyc={onNext} />
    </div>
  );
}

/* ---------------- Step 4 — Validate KYC Details ---------------- */

const DOC_TYPES = [
  { label: "PAN", value: "C" },
  { label: "Passport", value: "A" },
  { label: "Voter ID", value: "B" },
  { label: "Driving License", value: "D" },
  { label: "Aadhaar", value: "E" },
  { label: "NREGA Job Card", value: "F" },
  { label: "GSTIN", value: "G" },
  { label: "CKYC Number", value: "Z" },
] as const;

const CUSTOMER_TYPES = [
  { label: "Individual", value: "I" },
  { label: "Organization", value: "O" },
] as const;

const INSURANCE_TYPES = [
  { label: "MOTOR", value: "MOTOR" },
] as const;

/** Format a Date to DD-MMM-YYYY, e.g. 08-Nov-2004 */
function formatDDMMMYYYY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mmm = d.toLocaleString("en-US", { month: "short" });
  const yyyy = d.getFullYear();
  return `${dd}-${mmm}-${yyyy}`;
}

/** Parse DD-MMM-YYYY back to a Date (returns undefined on failure) */
function parseDDMMMYYYY(s: string): Date | undefined {
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const [dd, mmm, yyyy] = s.split("-");
  if (!dd || !mmm || !yyyy || !(mmm in months)) return undefined;
  return new Date(Number(yyyy), months[mmm], Number(dd));
}

function Step4({ productCode, onNext }: { productCode: string; onNext: () => void }) {
  const dispatch = useAppDispatch();
  const transactionId = useAppSelector((s) => s.insurance.transactionId);

  const DEFAULT_DOB_STR = "08-Nov-2004";
  const DEFAULT_DOB_DATE = parseDDMMMYYYY(DEFAULT_DOB_STR);

  const [form, setForm] = useState({
    docTypeCode: "C",          // PAN default
    docNumber: "AFFPK4566H",
    dobStr: DEFAULT_DOB_STR,
    dobDate: DEFAULT_DOB_DATE as Date | undefined,
    customerType: "I",
    insuranceType: "MOTOR",
  });

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitValidateKyc, { isLoading, data, isError, error, reset }] = useValidateKycMutation();

  // Show toast on API error
  useEffect(() => {
    if (isError) {
      toast.error("KYC validation failed", {
        description:
          (error as { data?: { message?: string } })?.data?.message ??
          "An unexpected error occurred. Please try again.",
      });
    }
  }, [isError, error]);

  console.log(data)

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.docNumber.trim()) e.docNumber = "Document Number is required";
    if (!form.dobStr) e.dob = "Date of Birth is required";
    if (!transactionId) e.transactionId = "Transaction ID is not available — please complete Calculate Premium first";
    if (!productCode) e.productCode = "Product Code is not available";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      doc_type_code: form.docTypeCode,
      doc_number: form.docNumber.trim(),
      transaction_id: transactionId!,
      dob: form.dobStr,
      product_code: productCode,
      sys_type: "OPUS",
      location_code: "9906",
      customer_type: form.customerType,
      insurance_type: form.insuranceType,
    };
    // Save values for Step 5 to consume
    dispatch(setKycFormValues({
      dob: form.dobStr,
      location_code: "9906",
      customer_type: form.customerType,
      product_code: productCode,
      transaction_id: transactionId!,
    }));
    submitValidateKyc(payload);
  };

  useEffect(() => {
    if (data?.success) {
      dispatch(setKycResponse({
        success: data.success,
        message: data.message,
        data: data.data,
      }));
      toast.success("KYC validated successfully!", {
        description: data.message || "Your CKYC verification is complete.",
      });
      onNext();
    }
  }, [data, dispatch]);

  const inputClass = (hasError?: boolean) =>
    `w-full rounded-xl border bg-[var(--background)]/60 px-3 py-2.5 text-sm outline-none ring-[var(--ring)] transition focus:ring-2 ${hasError ? "border-destructive" : "border-[var(--border)]"}`;

  const readOnlyClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--muted)]/60 px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass rounded-3xl p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--brand)]/10">
            <ShieldCheck className="h-5 w-5 text-[var(--brand)]" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Validate KYC Details</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Submit CKYC verification request.</p>
          </div>
        </div>

        {/* Missing prerequisite warning */}
        {!transactionId && (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            Transaction ID is not available. Please complete the Calculate Premium step first.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">

          {/* Document Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Document Type <span className="text-destructive">*</span>
            </label>
            <select
              value={form.docTypeCode}
              onChange={(e) => setForm((f) => ({ ...f, docTypeCode: e.target.value }))}
              className={inputClass(!!errors.docTypeCode)}
            >
              {DOC_TYPES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            {errors.docTypeCode && <p className="mt-1 text-[11px] text-destructive">{errors.docTypeCode}</p>}
          </div>

          {/* Document Number */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Document Number <span className="text-destructive">*</span>
            </label>
            <input
              value={form.docNumber}
              onChange={(e) => setForm((f) => ({ ...f, docNumber: e.target.value }))}
              placeholder="e.g. AFFPK4566H"
              className={inputClass(!!errors.docNumber)}
            />
            {errors.docNumber && <p className="mt-1 text-[11px] text-destructive">{errors.docNumber}</p>}
          </div>

          {/* Date of Birth — Calendar Picker only */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Date of Birth <span className="text-destructive">*</span>
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between rounded-xl border bg-[var(--background)]/60 px-3 py-2.5 text-sm transition hover:bg-[var(--background)]/80 ${errors.dob ? "border-destructive" : "border-[var(--border)]"}`}
                >
                  <span className={form.dobStr ? "text-foreground" : "text-muted-foreground"}>
                    {form.dobStr || "Select date"}
                  </span>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.dobDate}
                  onSelect={(date) => {
                    if (!date) return;
                    setForm((f) => ({
                      ...f,
                      dobDate: date,
                      dobStr: formatDDMMMYYYY(date),
                    }));
                    setCalendarOpen(false);
                    setErrors((e) => ({ ...e, dob: undefined }));
                  }}
                  captionLayout="dropdown"
                  defaultMonth={form.dobDate ?? new Date(2004, 10, 8)}
                  fromYear={1924}
                  toYear={new Date().getFullYear()}
                  disabled={(d) => d > new Date()}
                />
              </PopoverContent>
            </Popover>
            {errors.dob && <p className="mt-1 text-[11px] text-destructive">{errors.dob}</p>}
          </div>

          {/* Customer Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Customer Type <span className="text-destructive">*</span>
            </label>
            <select
              value={form.customerType}
              onChange={(e) => setForm((f) => ({ ...f, customerType: e.target.value }))}
              className={inputClass(!!errors.customerType)}
            >
              {CUSTOMER_TYPES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Insurance Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Insurance Type <span className="text-destructive">*</span>
            </label>
            <select
              value={form.insuranceType}
              onChange={(e) => setForm((f) => ({ ...f, insuranceType: e.target.value }))}
              className={inputClass()}
            >
              {INSURANCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Transaction ID — read only */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Transaction ID
              {/* <span className="ml-1.5 rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Auto</span> */}
            </label>
            <div className={readOnlyClass}>
              {transactionId ?? <span className="italic opacity-60">Awaiting Calculate Premium…</span>}
            </div>
            {errors.transactionId && <p className="mt-1 text-[11px] text-destructive">{errors.transactionId}</p>}
          </div>

          {/* Product Code — read only */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Product Code
              {/* <span className="ml-1.5 rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Auto</span> */}
            </label>
            <div className={readOnlyClass}>
              {productCode || <span className="italic opacity-60">Not available</span>}
            </div>
            {errors.productCode && <p className="mt-1 text-[11px] text-destructive">{errors.productCode}</p>}
          </div>

          {/* System Type — static read only */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              System Type
              {/* <span className="ml-1.5 rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Static</span> */}
            </label>
            <div className={readOnlyClass}>OPUS</div>
          </div>

          {/* Location Code — static read only */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Location Code
              {/* <span className="ml-1.5 rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Static</span> */}
            </label>
            <div className={readOnlyClass}>9906</div>
          </div>

        </div>

        {/* Submit */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-elegant transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Validating…</>
            ) : (
              <>Validate KYC <ShieldCheck className="h-4 w-4" /></>
            )}
          </button>
        </div>

        {/* API Error */}
        {isError && (
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <div className="font-medium">Validation failed</div>
            <div className="mt-0.5 text-xs opacity-80">
              {(error as { data?: { message?: string } })?.data?.message ?? "An unexpected error occurred. Please try again."}
            </div>
            <button onClick={reset} className="mt-2 text-xs underline underline-offset-2">Dismiss</button>
          </div>
        )}

        {/* Success response */}
   

  
      </div>
    </div>
  );
}

/* ---------------- Step 5 — Upload KYC Document ---------------- */

const UPLOAD_DOC_TYPES = [
  { label: "UID (Aadhaar)", value: "E" },
  { label: "Passport", value: "A" },
  { label: "Voter ID", value: "B" },
  { label: "Driving License", value: "D" },
  { label: "NREGA Job Card", value: "F" },
] as const;

function Step5({ productCode }: { productCode: string }) {
  const dispatch = useAppDispatch();
  const kycFormValues = useAppSelector((s) => s.insurance.kycFormValues);

  // Read-only values sourced from the previous (Step 4 / Validate KYC) API
  const transactionId = kycFormValues?.transaction_id ?? useAppSelector((s) => s.insurance.transactionId) ?? "";
  const dob           = kycFormValues?.dob            ?? "";
  const locationCode  = kycFormValues?.location_code  ?? "9906";
  const customerType  = kycFormValues?.customer_type  ?? "I";
  const effectiveProd = kycFormValues?.product_code   ?? productCode;

  const [form, setForm] = useState({
    docTypeCategory: "E",   // UID (Aadhaar) default
    docNumber: "2123",
  });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadKycDocument, { isLoading, data, isError, error, reset }] = useUploadKycDocumentMutation();

  // Toast on API error
  useEffect(() => {
    if (isError) {
      toast.error("Upload failed", {
        description:
          (error as { data?: { message?: string } })?.data?.message ??
          "Could not upload the document. Please try again.",
      });
    }
  }, [isError, error]);

  // Toast on success
  useEffect(() => {
    if (data?.success) {
      toast.success("KYC document uploaded successfully!", {
        description: data.message || "Your document has been submitted.",
      });
    }
  }, [data]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.docNumber.trim())  e.docNumber = "Document Number is required";
    if (!docFile)                e.docFile   = "Please select a PDF file to upload";
    if (!transactionId)          e.transactionId = "Transaction ID is not available — complete Validate KYC first";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type !== "application/pdf") {
      setErrors((prev) => ({ ...prev, docFile: "Only PDF files are allowed" }));
      e.target.value = "";
      return;
    }
    setDocFile(file);
    setErrors((prev) => ({ ...prev, docFile: "" }));
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const fd = new FormData();
    fd.append("doc_type_category", form.docTypeCategory);
    fd.append("doc_number",        form.docNumber.trim());
    fd.append("transaction_id",    transactionId);
    fd.append("dob",               dob);
    fd.append("product_code",      effectiveProd);
    fd.append("location_code",     locationCode);
    fd.append("customer_type",     customerType);
    fd.append("doc",               docFile!);

    uploadKycDocument(fd);
  };

  const inputClass = (hasError?: boolean) =>
    `w-full rounded-xl border bg-[var(--background)]/60 px-3 py-2.5 text-sm outline-none ring-[var(--ring)] transition focus:ring-2 ${hasError ? "border-destructive" : "border-[var(--border)]"}`;

  const readOnlyClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--muted)]/60 px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass rounded-3xl p-6 sm:p-8">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--brand)]/10">
            <FileText className="h-5 w-5 text-[var(--brand)]" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Upload KYC Document</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Submit your identity document as a PDF.</p>
          </div>
        </div>

        {/* Missing prerequisite warning */}
        {!transactionId && (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            Transaction ID is not available. Please complete the Validate KYC step first.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">

          {/* Document Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Document Type <span className="text-destructive">*</span>
            </label>
            <select
              value={form.docTypeCategory}
              onChange={(e) => setForm((f) => ({ ...f, docTypeCategory: e.target.value }))}
              className={inputClass(!!errors.docTypeCategory)}
            >
              {UPLOAD_DOC_TYPES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            {errors.docTypeCategory && <p className="mt-1 text-[11px] text-destructive">{errors.docTypeCategory}</p>}
          </div>

          {/* Document Number */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Document Number <span className="text-destructive">*</span>
            </label>
            <input
              value={form.docNumber}
              onChange={(e) => setForm((f) => ({ ...f, docNumber: e.target.value }))}
              placeholder="e.g. 2123"
              className={inputClass(!!errors.docNumber)}
            />
            {errors.docNumber && <p className="mt-1 text-[11px] text-destructive">{errors.docNumber}</p>}
          </div>

          {/* Transaction ID — read only */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Transaction ID
              <span className="ml-1.5 rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Auto</span>
            </label>
            <div className={readOnlyClass}>
              {transactionId || <span className="italic opacity-60">Awaiting Validate KYC…</span>}
            </div>
            {errors.transactionId && <p className="mt-1 text-[11px] text-destructive">{errors.transactionId}</p>}
          </div>

          {/* Date of Birth — read only */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Date of Birth
              <span className="ml-1.5 rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Auto</span>
            </label>
            <div className={readOnlyClass}>
              {dob || <span className="italic opacity-60">Awaiting Validate KYC…</span>}
            </div>
          </div>

          {/* Product Code — read only */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Product Code
              <span className="ml-1.5 rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Auto</span>
            </label>
            <div className={readOnlyClass}>
              {effectiveProd || <span className="italic opacity-60">Not available</span>}
            </div>
          </div>

          {/* Location Code — read only */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Location Code
              <span className="ml-1.5 rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Auto</span>
            </label>
            <div className={readOnlyClass}>{locationCode}</div>
          </div>

          {/* Customer Type — read only */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Customer Type
              <span className="ml-1.5 rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Auto</span>
            </label>
            <div className={readOnlyClass}>
              {customerType === "I" ? "Individual" : customerType === "O" ? "Organization" : customerType}
            </div>
          </div>

          {/* Document Upload — full width */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Document (PDF) <span className="text-destructive">*</span>
            </label>
            <label
              className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition hover:bg-[var(--brand)]/5 ${
                errors.docFile ? "border-destructive" : "border-[var(--border)] hover:border-[var(--brand)]/50"
              } ${docFile ? "bg-[var(--brand)]/5 border-[var(--brand)]/40" : ""}`}
            >
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={handleFileChange}
              />
              {docFile ? (
                <>
                  <FileText className="h-8 w-8 text-[var(--brand)]" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground">{docFile.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {(docFile.size / 1024).toFixed(1)} KB · PDF
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setDocFile(null); }}
                    className="mt-1 text-xs text-destructive underline underline-offset-2"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--muted)]">
                    <ArrowRight className="h-5 w-5 rotate-[-90deg] text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">Click to upload PDF</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">PDF files only</div>
                  </div>
                </>
              )}
            </label>
            {errors.docFile && <p className="mt-1 text-[11px] text-destructive">{errors.docFile}</p>}
          </div>

        </div>

        {/* Submit */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-elegant transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
            ) : (
              <>Upload Document <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </div>

        {/* API Error */}
        {isError && (
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <div className="font-medium">Upload failed</div>
            <div className="mt-0.5 text-xs opacity-80">
              {(error as { data?: { message?: string } })?.data?.message ?? "An unexpected error occurred. Please try again."}
            </div>
            <button onClick={reset} className="mt-2 text-xs underline underline-offset-2">Dismiss</button>
          </div>
        )}

        {/* Success */}
      

      </div>
    </div>
  );
}

/* ---------------- Shared UI pieces ---------------- */

function FormField({ label, placeholder, value, error, onChange }: { label: string; placeholder: string; value: string; error?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-[var(--background)]/60 px-3 py-2.5 text-sm outline-none ring-[var(--ring)] transition focus:ring-2 ${error ? "border-destructive" : "border-[var(--border)]"}`}
      />
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
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
      <div className="h-4 w-40 rounded-full bg-[var(--muted)]" />
      <div className="h-7 w-2/3 rounded-full bg-[var(--muted)]" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-[var(--muted)]" />
        ))}
      </div>
      <div className="h-32 rounded-3xl bg-[var(--muted)]" />
      <div className="h-40 rounded-3xl bg-[var(--muted)]" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid place-items-center py-12 text-center">
      <div className="text-sm text-destructive">Couldn't calculate premium. Please check your details and try again.</div>
      <button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]">
        <RotateCw className="h-4 w-4" /> Edit Details & Retry
      </button>
    </div>
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

function BuyStickyCTA({ amount, onProceedKyc }: { amount: number; onProceedKyc: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-5 pt-3 sm:px-6">
      <div className="glass-strong mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl p-3 pl-5 shadow-elegant">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Final Premium</div>
          <div className="font-display text-xl font-bold">₹{amount.toLocaleString("en-IN")}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* <button
            onClick={onProceedKyc}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--brand)]/10"
          >
            Validate KYC <ShieldCheck className="h-4 w-4" />
          </button> */}

           <button onClick={onProceedKyc} className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-elegant transition hover:scale-[1.02]">
 Validate KYC  <ArrowRight className="h-4 w-4" />
            </button>
          {/* <button className="relative inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-elegant animate-pulse-ring">
            Buy Policy Now <ArrowRight className="h-4 w-4" />
          </button> */}
        </div>
      </div>
    </div>
  );
}

function fmt(n: string | number) {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
