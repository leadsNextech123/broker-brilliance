import { Check, Languages } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleLanguage, type LanguageCode } from "@/features/language/languageSlice";
import { STRINGS } from "@/i18n/strings";
import { motion, AnimatePresence } from "framer-motion";

const OPTIONS: LanguageCode[] = ["en", "hi"];

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = useAppSelector((s) => s.language.selectedLanguages);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const label = selected.map((c) => STRINGS[c].name).join(" • ");

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:scale-[1.02]"
        aria-label="Select language"
      >
        <Languages className="h-4 w-4 text-[var(--brand)]" />
        <span>{label}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="glass-strong absolute right-0 mt-2 w-52 rounded-2xl p-2 shadow-elegant"
          >
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Multi-select
            </div>
            {OPTIONS.map((code) => {
              const active = selected.includes(code);
              return (
                <button
                  key={code}
                  onClick={() => dispatch(toggleLanguage(code))}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-[var(--accent)]"
                >
                  <span className="font-medium">{STRINGS[code].name}</span>
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-md border transition ${
                      active
                        ? "border-transparent bg-[var(--brand)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
