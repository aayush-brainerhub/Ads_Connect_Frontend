import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Target, Compass, Scale, Rocket } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorks,
  head: () => ({
    meta: [
      { title: "How it works — AdsConnect" },
      {
        name: "description",
        content:
          "From goals to placements: how AdsConnect turns business questions into a confident advertising plan in four steps.",
      },
      { property: "og:title", content: "How AdsConnect works" },
      {
        property: "og:description",
        content: "A clear four-step path from your goal to the right ads, in the right places.",
      },
    ],
  }),
});

const STEPS = [
  {
    n: "01",
    icon: Target,
    title: "Tell us your goal",
    body: "Foot traffic, leads, repeat orders, awareness — we start with the outcome that matters to your business, not the channel.",
  },
  {
    n: "02",
    icon: Compass,
    title: "We map your audience",
    body: "Where they live, what they watch, who they trust. We blend first-party signals with regional and category benchmarks.",
  },
  {
    n: "03",
    icon: Scale,
    title: "Compare every channel",
    body: "Search, social, influencers, billboards, radio, local press — side by side, ranked by fit, reach and cost for your goal.",
  },
  {
    n: "04",
    icon: Rocket,
    title: "Launch and learn",
    body: "Approve the plan, place the ads, and read plain-language reports that tie spend back to the outcome you started with.",
  },
];

function HowItWorks() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[1100px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.10),transparent_70%)] blur-2xl" />
        <div className="absolute top-1/3 -left-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(120,180,255,0.10),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <section className="relative px-6 md:px-10 pt-32 md:pt-40 pb-20 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          How it works
        </div>
        <h1 className="mt-6 text-5xl md:text-7xl font-medium tracking-tight leading-[1.02]">
          From a question to a
          <br />
          <span className="bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
            confident plan.
          </span>
        </h1>
        <p className="mt-7 max-w-2xl text-white/70 text-lg leading-relaxed tracking-tight">
          AdsConnect removes the guesswork from advertising. Four steps, no jargon, and a path you can
          actually follow — whether you run a single storefront or a national brand.
        </p>
      </section>

      <section className="relative px-6 md:px-10 pb-28 max-w-6xl mx-auto">
        <ol className="grid gap-5 md:grid-cols-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li
                key={s.n}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-8 md:p-10 transition-all duration-500 hover:border-white/25 hover:from-white/[0.08]"
                style={{ transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)" }}
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/[0.04] blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                <span className="absolute right-6 top-6 text-[88px] leading-none font-medium tracking-tight text-white/[0.06] select-none">
                  {s.n}
                </span>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-white">
                  <Icon size={20} />
                </div>
                <h2 className="relative mt-6 text-2xl md:text-[28px] font-medium tracking-tight">
                  {s.title}
                </h2>
                <p className="relative mt-3 text-white/65 leading-relaxed">{s.body}</p>
                <div className="relative mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">
                  Step {i + 1} of {STEPS.length}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link
            to="/channels"
            className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium tracking-tight hover:bg-white/90 transition-colors"
          >
            See the channels we cover
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/faq"
            className="inline-flex items-center rounded-full border border-white/20 text-white px-6 py-3 text-sm font-medium tracking-tight hover:bg-white/5 transition-colors"
          >
            Common questions
          </Link>
        </div>
      </section>
    </main>
  );
}