import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  step: number;
  labels: string[];
}

export function Stepper({ step, labels }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-2xl items-center gap-2 sm:gap-4">
      {labels.map((label, idx) => {
        const n = idx + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                initial={false}
                animate={{
                  scale: active ? 1.05 : 1,
                  backgroundColor: done || active ? "var(--brand)" : "var(--muted)",
                }}
                className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-[var(--primary-foreground)]"
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <span>{n}</span>}
                {active && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-[var(--brand)]/40 blur-md" />
                )}
              </motion.div>
              <div
                className={`hidden text-sm font-medium sm:block ${
                  active || done ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </div>
            </div>
            {idx < labels.length - 1 && (
              <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                <motion.div
                  initial={false}
                  animate={{ width: done ? "100%" : active ? "50%" : "0%" }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-y-0 left-0 bg-[var(--brand)]"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
