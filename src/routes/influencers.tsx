import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Users, MessageCircle, LineChart, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/influencers")({
  component: Influencers,
  head: () => ({
    meta: [
      { title: "Influencers — How to choose the right one | AdsConnect" },
      {
        name: "description",
        content:
          "Audience overlap, authenticity, past performance and price — the four checks that separate the right influencer from a costly mistake.",
      },
      { property: "og:title", content: "How to choose the right influencer" },
      {
        property: "og:description",
        content: "Stop picking by follower count. Here are the four signals that actually predict results.",
      },
    ],
  }),
});

const CRITERIA = [
  {
    title: "Audience overlap",
    icon: Users,
    weight: "40%",
    body: "The single best predictor. We match the creator's audience to your buyer profile — geography, age, interests, purchase signals.",
  },
  {
    title: "Engagement quality",
    icon: MessageCircle,
    weight: "25%",
    body: "Real replies and saves beat passive likes. We weight comment depth and creator response rate, not vanity ratios.",
  },
  {
    title: "Past performance",
    icon: LineChart,
    weight: "25%",
    body: "Median performance across recent brand work, not the one viral post. We surface honest benchmarks per category.",
  },
  {
    title: "Brand fit and safety",
    icon: ShieldCheck,
    weight: "10%",
    body: "Tone, values and history. Cheap reach next to the wrong content costs more than it earns.",
  },
];

function Influencers() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/3 h-[520px] w-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(255,180,140,0.10),transparent_70%)] blur-3xl" />
        <div className="absolute top-1/2 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(140,255,200,0.08),transparent_70%)] blur-3xl" />
      </div>

      <section className="relative px-6 md:px-10 pt-32 md:pt-40 pb-16 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Influencers
        </div>
        <h1 className="mt-6 text-5xl md:text-7xl font-medium tracking-tight leading-[1.02]">
          Which influencer
          <br />
          <span className="bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
            should you choose?
          </span>
        </h1>
        <p className="mt-7 max-w-2xl text-white/70 text-lg leading-relaxed tracking-tight">
          Follower count is the loudest signal and the weakest one. AdsConnect scores creators on the
          four things that actually predict whether a partnership will work.
        </p>
      </section>

      <section className="relative px-6 md:px-10 pb-20 max-w-6xl mx-auto">
        <div className="grid gap-5 md:grid-cols-2">
          {CRITERIA.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-8 transition-all duration-500 hover:border-white/25"
                style={{ transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04]">
                    <Icon size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Weight</div>
                    <div className="text-xl font-medium tracking-tight">{c.weight}</div>
                  </div>
                </div>
                <h2 className="mt-6 text-xl md:text-2xl font-medium tracking-tight">{c.title}</h2>
                <p className="mt-3 text-white/70 leading-relaxed">{c.body}</p>
                <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-white/80 to-white/30"
                    style={{ width: c.weight }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative px-6 md:px-10 pb-28 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 p-8 md:p-12 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent">
          <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-white/[0.05] blur-3xl" />
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight">A simple shortlist process</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Define the outcome — awareness, trial, or repeat purchase.",
              "Filter by audience overlap above a sensible threshold.",
              "Compare engagement quality and historical performance.",
              "Negotiate based on a fair benchmark, not a quoted rate card.",
            ].map((step, i) => (
              <li key={i} className="flex gap-4 rounded-xl border border-white/10 bg-black/40 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-sm font-medium">
                  {i + 1}
                </span>
                <span className="text-white/75 leading-relaxed text-sm">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Link
              to="/faq"
              className="group inline-flex items-center gap-2 text-white/80 hover:text-white text-sm tracking-tight"
            >
              More common questions
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}