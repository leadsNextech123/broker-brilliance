import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { LanguageSelector } from "./LanguageSelector";

export function TopBar() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
      <Link to="/" className="outline-none">
        <Logo />
      </Link>
      <LanguageSelector />
    </header>
  );
}
