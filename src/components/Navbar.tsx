import { ArrowRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

const EASE = "cubic-bezier(0.23,1,0.32,1)";

export const NAV_ITEMS: { label: string; to: string }[] = [
  { label: "How it works", to: "/how-it-works" },
  { label: "Channels", to: "/channels" },
  { label: "Influencers", to: "/influencers" },
  { label: "FAQ", to: "/faq" },
];

function HamburgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="relative z-[60] h-10 w-10 inline-flex items-center justify-center text-white md:hidden"
    >
      <span
        className="absolute inset-0 inline-flex items-center justify-center"
        style={{
          opacity: open ? 0 : 1,
          transform: open ? "rotate(-90deg) scale(0.5)" : "rotate(0deg) scale(1)",
          transition: `opacity 0.3s ${EASE}, transform 0.3s ${EASE}`,
        }}
      >
        <Menu size={22} strokeWidth={1.5} />
      </span>
      <span
        className="absolute inset-0 inline-flex items-center justify-center"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.5)",
          transition: `opacity 0.3s ${EASE}, transform 0.3s ${EASE}`,
        }}
      >
        <X size={22} strokeWidth={1.5} />
      </span>
    </button>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        className="fixed inset-0 z-40 md:hidden"
        style={{
          pointerEvents: open ? "auto" : "none",
          backgroundColor: open ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
          backdropFilter: open ? "blur(12px)" : "blur(0px)",
          WebkitBackdropFilter: open ? "blur(12px)" : "blur(0px)",
          transition: "background-color 0.5s ease, backdrop-filter 0.5s ease",
        }}
      />
      <div
        className="fixed left-0 right-0 top-0 z-50 overflow-hidden md:hidden"
        style={{
          maxHeight: open ? 420 : 0,
          transition: `max-height 0.5s ${EASE}`,
        }}
      >
        <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 pt-24 pb-8 px-6">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className="group flex items-center justify-between py-3 text-white/90 text-lg tracking-tight border-b border-white/5"
                style={{
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0)" : "translateY(-8px)",
                  transition: `opacity 0.4s ${EASE} ${i * 50 + 80}ms, transform 0.4s ${EASE} ${i * 50 + 80}ms`,
                }}
              >
                <span>{item.label}</span>
                <ArrowRight
                  size={16}
                  className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
                />
              </Link>
            ))}
          </nav>
          <div
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(-8px)",
              transition: `opacity 0.4s ${EASE} 360ms, transform 0.4s ${EASE} 360ms`,
            }}
            className="mt-6"
          >
            <a
              href="#"
              className="inline-flex w-full items-center justify-center rounded-full bg-white text-black px-5 py-3 text-sm font-medium tracking-tight hover:bg-white/90 transition-colors"
            >
              Join the wait
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (
    pathname.startsWith("/app") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding")
  ) {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 flex items-center justify-between">
        <Link to="/" className="text-white text-xl font-semibold tracking-tight relative z-[60]">
          AdsConnect
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-white/70 hover:text-white text-sm tracking-tight transition-colors"
              activeProps={{ className: "text-white text-sm tracking-tight transition-colors" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
          <Link
            to="/auth/login"
            className="hidden md:inline-flex items-center rounded-full bg-white text-black px-4 py-2 text-sm font-medium tracking-tight hover:bg-white/90 transition-colors"
          >
            Open app
          </Link>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}