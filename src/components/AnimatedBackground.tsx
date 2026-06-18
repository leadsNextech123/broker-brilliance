import { Car, Bike, ShieldCheck, FileText, Wallet, BadgeCheck } from "lucide-react";

const FLOATERS = [
  { Icon: Car, top: "12%", left: "8%", delay: "0s", size: 28 },
  { Icon: Bike, top: "22%", right: "10%", delay: "1.2s", size: 26 },
  { Icon: ShieldCheck, top: "70%", left: "6%", delay: "0.6s", size: 24 },
  { Icon: FileText, top: "78%", right: "12%", delay: "2s", size: 22 },
  { Icon: Wallet, top: "44%", left: "4%", delay: "1.6s", size: 22 },
  { Icon: BadgeCheck, top: "58%", right: "6%", delay: "0.4s", size: 22 },
];

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[var(--brand)]/30 blur-3xl animate-blob" />
      <div
        className="absolute right-0 top-40 h-96 w-96 rounded-full bg-[var(--accent-lime)]/25 blur-3xl animate-blob"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[var(--brand-glow)]/30 blur-3xl animate-blob"
        style={{ animationDelay: "6s" }}
      />
      {FLOATERS.map(({ Icon, size, ...pos }, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-30 dark:opacity-40"
          style={{ ...pos, animationDelay: pos.delay }}
        >
          <div className="glass grid place-items-center rounded-2xl p-3">
            <Icon style={{ width: size, height: size }} className="text-[var(--brand)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
