import { ShieldCheck } from "lucide-react";
import image from '../assets/logo.svg'
export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src={image}></img>
      {/* <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-glow)] shadow-elegant">
        <ShieldCheck className="h-5 w-5 text-[var(--primary-foreground)]" strokeWidth={2.5} />
        <span className="absolute -inset-1 -z-10 rounded-2xl bg-[var(--brand)]/30 blur-xl" />
      </div> */}
      {/* <div className="leading-tight">
        <div className="font-display text-[15px] font-bold tracking-tight">Leads</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Insurance Broker
        </div>
      </div> */}
    </div>
  );
}
