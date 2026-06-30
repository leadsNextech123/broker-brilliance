import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Car,
  Bike,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Star,
  FileSearch,
  SlidersHorizontal,
  BadgeCheck,
  PhoneCall,
  Quote,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useAppDispatch, useAppSelector } from "@/store";
import { setVehicleType, type VehicleType } from "@/features/insurance/insuranceSlice";
import { useStrings } from "@/i18n/strings";
import { useFetchProductsQuery } from "@/services/productApi";

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
  const { data: result } = useFetchProductsQuery();

  const langs = useAppSelector((s) => s.language.selectedLanguages);
  const t = useStrings(langs);

  const go = (type: VehicleType, product_code: string | number) => {
    dispatch(setVehicleType(type));
    navigate({
      to: "/insurance/$type",
      params: {
        type: type.toLowerCase() as "4w" | "2w",
      },
      search: {
        product_code,
      },
    });
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAF7]">
      <TopBar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-gradient-to-b from-[#EFE9FF] via-[#F6F3FF] to-transparent" />
        <div className="pointer-events-none absolute -right-32 top-10 -z-10 h-96 w-96 rounded-full bg-[#6C47FF]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-64 -z-10 h-72 w-72 rounded-full bg-[#B6FF3C]/20 blur-3xl" />

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-10 pt-14 sm:pt-20">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#6C47FF] shadow-sm ring-1 ring-[#6C47FF]/15"
          >
            <Star className="h-3.5 w-3.5 fill-[#6C47FF] text-[#6C47FF]" />
            Rated 4.7 by 2M+ customers
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-3xl text-center text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-[#1A1A2E] sm:text-6xl"
          >
            {t.heroTitle.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#6C47FF]">
                {t.heroTitle.split(" ").slice(-2).join(" ")}
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="absolute -bottom-1 left-0 h-3 w-full origin-left rounded-full bg-[#B6FF3C]/70 sm:-bottom-2 sm:h-4"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-5 max-w-xl text-center text-base text-[#5B5B6B] sm:text-lg"
          >
            {t.heroSub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-[#5B5B6B]"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#6C47FF]" /> 25+ Insurers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-[#6C47FF]" /> Instant policy
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#6C47FF]" /> 5-minute checkout
            </span>
          </motion.div>

          {/* VEHICLE PICKER */}
          <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
            {result?.data?.map((item, i) => (
              <VehicleCard
                key={item.product_code}
                type={item.vehicle_type}
                subtitle={item.coverage_type}
                cta={t.getQuote}
                onClick={() => go(item.vehicle_type, item.product_code)}
                delay={0.4 + i * 0.08}
              />
            ))}
          </div>

          <p className="mt-5 text-xs text-[#8A8A9A]">
            No spam calls. No paperwork. Just your policy, instantly.
          </p>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-[#1A1A2E]/5 bg-white py-8">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-6 sm:grid-cols-4">
          {[
            { value: "2M+", label: "Policies issued" },
            { value: "₹500Cr+", label: "Claims settled" },
            { value: "98%", label: "Claim settlement ratio" },
            { value: "4.7/5", label: "Average rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-extrabold text-[#1A1A2E] sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-[#8A8A9A] sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6C47FF]">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1A1A2E] sm:text-4xl">
            Insurance, sorted in three steps
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: <FileSearch className="h-6 w-6" />,
              title: "Share your details",
              desc: "Tell us about your vehicle. Takes under a minute, no documents needed upfront.",
            },
            {
              icon: <SlidersHorizontal className="h-6 w-6" />,
              title: "Compare real quotes",
              desc: "See live prices from 25+ insurers side by side and pick what fits your budget.",
            },
            {
              icon: <BadgeCheck className="h-6 w-6" />,
              title: "Get covered instantly",
              desc: "Pay securely and your policy lands in your inbox in minutes, not days.",
            },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-3xl bg-white p-7 ring-1 ring-[#1A1A2E]/5"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#F4F1FF] text-[#6C47FF]">
                {step.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#1A1A2E]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5B5B6B]">{step.desc}</p>
              <span className="absolute right-6 top-6 text-3xl font-extrabold text-[#1A1A2E]/5">
                0{i + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-[#1A1A2E] py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B6FF3C]">
              Why people switch to us
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Built to actually pay out
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Zap className="h-5 w-5" />,
                title: "Zero paperwork claims",
                desc: "Raise and track claims entirely from your phone.",
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "No-questions cashless garages",
                desc: "8,000+ network garages across India.",
              },
              {
                icon: <Clock className="h-5 w-5" />,
                title: "24/7 roadside assistance",
                desc: "Help reaches you, day or night, anywhere.",
              },
              {
                icon: <PhoneCall className="h-5 w-5" />,
                title: "Real humans on call",
                desc: "No bots. Talk to a claims expert directly.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#B6FF3C]/15 text-[#B6FF3C]">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-sm font-bold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="mx-auto w-full max-w-4xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-white p-10 text-center shadow-[0_2px_24px_rgba(20,20,43,0.06)] ring-1 ring-[#1A1A2E]/5"
        >
          <Quote className="mx-auto h-8 w-8 text-[#6C47FF]/30" />
          <p className="mt-5 text-lg font-medium leading-relaxed text-[#1A1A2E] sm:text-xl">
            My bike was stolen and I had the claim amount in my account within four days.
            No back-and-forth, no runaround.
          </p>
          <div className="mt-5 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-[#FFB800] text-[#FFB800]" />
            ))}
          </div>
          <div className="mt-3 text-sm font-semibold text-[#1A1A2E]">Rohit Sharma</div>
          <div className="text-xs text-[#8A8A9A]">Two wheeler policy holder, Pune</div>
        </motion.div>
      </section>

      {/* CLOSING CTA */}
      <section className="px-6 pb-24">
        <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[32px] bg-[#6C47FF] px-8 py-14 text-center sm:px-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#B6FF3C]/20 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Get a quote before your chai gets cold
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-white/80 sm:text-base">
            Takes under 2 minutes. No spam calls, ever.
          </p>
          <button
            onClick={() =>
              document.querySelector("section")?.scrollIntoView({ behavior: "smooth" })
            }
            className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#1A1A2E] transition hover:gap-3"
          >
            Compare plans now <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

interface CardProps {
  type: VehicleType;
  subtitle: string;
  cta: string;
  onClick: () => void;
  delay: number;
}

function VehicleCard({ type, subtitle, cta, onClick, delay }: CardProps) {
  const isFourWheeler = type === "4W";

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-[28px] bg-white p-7 text-left shadow-[0_2px_16px_rgba(20,20,43,0.06)] ring-1 ring-[#1A1A2E]/5 transition hover:shadow-[0_8px_28px_rgba(108,71,255,0.16)]"
    >
      <div
        className={`absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl transition group-hover:scale-125 ${
          isFourWheeler ? "bg-[#6C47FF]/10" : "bg-[#B6FF3C]/25"
        }`}
      />

      <div className="relative flex items-center justify-between">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F4F1FF] text-[#6C47FF]">
          {isFourWheeler ? <Car className="h-7 w-7" /> : <Bike className="h-7 w-7" />}
        </div>
        <span className="rounded-full bg-[#F4F1FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#6C47FF]">
          {isFourWheeler ? "Car" : "Bike"}
        </span>
      </div>

      <div className="relative mt-6">
        <h3 className="text-xl font-bold text-[#1A1A2E]">
          {isFourWheeler ? "Four Wheeler Insurance" : "Two Wheeler Insurance"}
        </h3>
        <p className="mt-1 text-sm text-[#8A8A9A]">{subtitle}</p>
      </div>

      <div className="relative mt-7 flex items-center justify-between">
        <span className="text-xs font-medium text-[#5B5B6B]">
          Starts <span className="font-bold text-[#1A1A2E]">₹2,094/yr</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white transition group-hover:gap-2.5 group-hover:bg-[#6C47FF]">
          {cta} <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </motion.button>
  );
}