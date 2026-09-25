import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, MessageCircleQuestion, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/faq")({
  component: FAQ,
  head: () => ({
    meta: [
      { title: "FAQ — AdsConnect" },
      {
        name: "description",
        content:
          "Straight answers to the advertising questions every business eventually asks — from getting customers to measuring billboards.",
      },
      { property: "og:title", content: "AdsConnect FAQ" },
      {
        property: "og:description",
        content: "How to get customers, where to advertise, which influencer to pick, and more.",
      },
    ],
  }),
});

const FAQS = [
  {
    q: "How do I get more customers?",
    a: "Start with the outcome, not the channel. Define what a customer is worth to you, then work backward to the lowest-friction way to reach more of them — usually a small, focused mix rather than one big bet.",
  },
  {
    q: "Where should I advertise?",
    a: "It depends on intent. If people are already searching for what you sell, search ads come first. If you need to create demand, social and influencers do more work. For local foot traffic, out-of-home and community media still earn their place.",
  },
  {
    q: "Which influencer should I choose?",
    a: "The one whose audience overlaps most with your buyer — not the one with the biggest reach. Engagement quality and past brand-work performance matter far more than follower count.",
  },
  {
    q: "Is a billboard worth it?",
    a: "Sometimes. Billboards work when footfall is high, the message is simple, and frequency is enough to be remembered. They fail when any of those three are missing. We model it before you sign.",
  },
  {
    q: "Which local media works best?",
    a: "Regional radio is still strong for mass local reach. Community papers and neighborhood newsletters punch above their weight for trusted, intent-driven categories like home services, healthcare and food.",
  },
  {
    q: "How much should a small business spend?",
    a: "A useful starting point is 5–10% of revenue for growing businesses, less for steady ones. The exact number matters less than spending consistently and measuring honestly.",
  },
  {
    q: "How do I know it's actually working?",
    a: "Tie spend to outcomes — calls, visits, orders, signups — not impressions. We report in plain language so you can answer 'is this paying off?' without a dashboard tour.",
  },
  {
    q: "Do I need an agency?",
    a: "Not necessarily. AdsConnect gives you the structure an agency provides without the retainer. Many teams use us alongside a specialist for creative.",
  },
];

function FAQ() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(140,200,255,0.10),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      </div>

      <section className="relative px-6 md:px-10 pt-32 md:pt-40 pb-12 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          FAQ
        </div>
        <h1 className="mt-6 text-5xl md:text-7xl font-medium tracking-tight leading-[1.02]">
          Straight
          <br />
          <span className="bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
            answers.
          </span>
        </h1>
        <p className="mt-7 text-white/70 text-lg leading-relaxed tracking-tight">
          The questions every business eventually asks about advertising — answered without spin.
        </p>
      </section>

      <section className="relative px-6 md:px-10 pb-20 max-w-3xl mx-auto">
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] px-6 py-5 transition-colors hover:border-white/20 open:border-white/25 open:from-white/[0.06]"
            >
              <summary className="flex cursor-pointer items-start justify-between gap-6 list-none">
                <h2 className="text-base md:text-lg font-medium tracking-tight text-white">{f.q}</h2>
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white/70 transition-transform duration-300 group-open:rotate-45">
                  <Plus size={14} />
                </span>
              </summary>
              <p className="mt-4 text-white/70 leading-relaxed text-sm md:text-base">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative px-6 md:px-10 pb-28 max-w-3xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-8 md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/[0.05] blur-3xl" />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04]">
            <MessageCircleQuestion size={20} />
          </div>
          <h2 className="mt-5 text-2xl md:text-3xl font-medium tracking-tight">Still have a question?</h2>
          <p className="mt-3 text-white/65 leading-relaxed max-w-lg">
            Join the wait and we'll be in touch with answers tailored to your business, geography and goals.
          </p>
          <div className="mt-7">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium tracking-tight hover:bg-white/90 transition-colors"
            >
              Join the wait
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}