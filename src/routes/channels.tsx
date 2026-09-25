import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, Share2, Sparkles, Building2, Radio, Newspaper } from "lucide-react";

export const Route = createFileRoute("/channels")({
  component: Channels,
  head: () => ({
    meta: [
      { title: "Channels — Where should you advertise? | AdsConnect" },
      {
        name: "description",
        content:
          "Search, social, influencers, billboards, radio and local press — compare every advertising channel by fit, reach and cost.",
      },
      { property: "og:title", content: "Where should you advertise?" },
      {
        property: "og:description",
        content: "A side-by-side look at the channels that move customers — and the ones that don't.",
      },
    ],
  }),
});

const CHANNELS = [
  {
    name: "Search ads",
    icon: Search,
    tag: "Direct response",
    best: "High-intent customers actively looking",
    cost: "Pay-per-click, scales with budget",
    note: "Strong for direct response. Weak when category demand is low.",
  },
  {
    name: "Social ads",
    icon: Share2,
    tag: "Demand creation",
    best: "Brand discovery and lookalike audiences",
    cost: "Flexible from small daily budgets",
    note: "Great targeting; creative quality is the biggest lever.",
  },
  {
    name: "Influencers",
    icon: Sparkles,
    tag: "Trust transfer",
    best: "Trust transfer in niche communities",
    cost: "Per-post or affiliate, varies widely",
    note: "Pick by audience overlap, not follower count.",
  },
  {
    name: "Billboards & out-of-home",
    icon: Building2,
    tag: "Local awareness",
    best: "Local awareness in high-traffic areas",
    cost: "Fixed monthly placement",
    note: "Worth it when footfall, frequency and message align — we model it.",
  },
  {
    name: "Radio & podcasts",
    icon: Radio,
    tag: "Audio reach",
    best: "Drive-time reach and host-read trust",
    cost: "Spot rates or sponsorship tiers",
    note: "Podcasts beat radio for narrow audiences; radio still wins on local mass reach.",
  },
  {
    name: "Local press & community",
    icon: Newspaper,
    tag: "Neighborhood",
    best: "Neighborhood credibility and events",
    cost: "Low entry, strong for SMBs",
    note: "Underrated for local services and openings.",
  },
];

function Channels() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-0 h-[520px] w-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(180,140,255,0.10),transparent_70%)] blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(120,200,255,0.08),transparent_70%)] blur-3xl" />
      </div>

      <section className="relative px-6 md:px-10 pt-32 md:pt-40 pb-16 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          Channels
        </div>
        <h1 className="mt-6 text-5xl md:text-7xl font-medium tracking-tight leading-[1.02]">
          Where should you
          <br />
          <span className="bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
            advertise?
          </span>
        </h1>
        <p className="mt-7 max-w-2xl text-white/70 text-lg leading-relaxed tracking-tight">
          There's no single right answer — only the right mix for your goal, your geography and your
          budget. Here's how the major channels actually compare.
        </p>
      </section>

      <section className="relative px-6 md:px-10 pb-24 max-w-6xl mx-auto">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            return (
              <article
                key={c.name}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-7 transition-all duration-500 hover:border-white/25 hover:-translate-y-1"
                style={{ transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)" }}
              >
                <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-white">
                    <Icon size={18} />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                    {c.tag}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-medium tracking-tight">{c.name}</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <div>
                    <dt className="text-white/45 uppercase tracking-[0.15em] text-[10px]">Best for</dt>
                    <dd className="mt-1 text-white/85">{c.best}</dd>
                  </div>
                  <div>
                    <dt className="text-white/45 uppercase tracking-[0.15em] text-[10px]">Cost shape</dt>
                    <dd className="mt-1 text-white/85">{c.cost}</dd>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <dt className="text-white/45 uppercase tracking-[0.15em] text-[10px]">Honest take</dt>
                    <dd className="mt-1 text-white/70 leading-relaxed">{c.note}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link
            to="/influencers"
            className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium tracking-tight hover:bg-white/90 transition-colors"
          >
            How we pick influencers
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