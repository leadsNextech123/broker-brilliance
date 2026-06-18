import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Car, Bike, ArrowRight, ShieldCheck, Zap, Clock } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useAppDispatch, useAppSelector } from "@/store";
import { setVehicleType, type VehicleType } from "@/features/insurance/insuranceSlice";
import { useStrings } from "@/i18n/strings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leads Insurance Broker — Compare Motor Insurance" },
      {
        name: "description",
        content:
          "Find the best motor insurance in minutes. Compare plans, calculate premiums and buy instantly.",
      },
      { property: "og:title", content: "Leads Insurance Broker" },
      {
        property: "og:description",
        content: "Compare and buy motor insurance in minutes.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const langs = useAppSelector((s) => s.language.selectedLanguages);
  const t = useStrings(langs);

  const go = (type: VehicleType) => {
    dispatch(setVehicleType(type));
    navigate({ to: "/insurance/$type", params: { type: type.toLowerCase() } });
  };

  return (
    <div className="relative min-h-screen">
      <TopBar />
      <main className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-16 pt-6 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--brand)]" />
          </span>
          IRDAI Registered Broker • Instant Quotes
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 max-w-4xl text-center text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {t.heroTitle.split(" ").slice(0, -2).join(" ")}{" "}
          <span className="text-gradient-brand">
            {t.heroTitle.split(" ").slice(-2).join(" ")}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-5 max-w-2xl text-center text-base text-muted-foreground sm:text-lg"
        >
          {t.heroSub}
        </motion.p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand)]" /> 25+ Insurers
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-[var(--brand)]" /> Instant Policy
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[var(--brand)]" /> 5-minute checkout
          </span>
        </div>

        <div className="mt-14 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          <VehicleCard
            type="4W"
            icon={<Car className="h-12 w-12" />}
            title={t.fourWheeler}
            subtitle={t.comprehensive}
            emoji="🚗"
            cta={t.getQuote}
            onClick={() => go("4W")}
            delay={0.35}
          />
          <VehicleCard
            type="2W"
            icon={<Bike className="h-12 w-12" />}
            title={t.twoWheeler}
            subtitle={t.comprehensive}
            emoji="🏍"
            cta={t.getQuote}
            onClick={() => go("2W")}
            delay={0.5}
          />
        </div>
      </main>
    </div>
  );
}

interface CardProps {
  type: VehicleType;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  emoji: string;
  cta: string;
  onClick: () => void;
  delay: number;
}

function VehicleCard({ type, icon, title, subtitle, emoji, cta, onClick, delay }: CardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass group relative overflow-hidden rounded-3xl p-8 text-left transition"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--brand)]/20 blur-2xl transition group-hover:scale-150" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[var(--accent-lime)]/20 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-glow)] text-[var(--primary-foreground)] shadow-elegant">
          {icon}
        </div>
        <span className="text-4xl" aria-hidden>
          {emoji}
        </span>
      </div>

      <div className="relative mt-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
          {type === "4W" ? "Four Wheeler" : "Two Wheeler"}
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold">{title}</h3>
        <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
      </div>

      <div className="relative mt-8 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-elegant transition group-hover:gap-3">
          {cta} <ArrowRight className="h-4 w-4" />
        </span>
        <span className="text-xs text-muted-foreground">Starts ₹2,094/yr</span>
      </div>
    </motion.button>
  );
}
