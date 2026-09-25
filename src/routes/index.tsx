import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AdsConnect — Advertising that works for every business" },
      {
        name: "description",
        content:
          "AdsConnect helps small, medium and large businesses choose the right channels, influencers and local media to reach the right customers.",
      },
    ],
  }),
});

const BG_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_155101_f2540600-6fe9-433e-8e48-b3f4b72f0727.mp4";

function Index() {
  return (
    <main className="relative w-full overflow-hidden bg-black text-white">
      <section className="relative min-h-screen w-full overflow-hidden">
      <video
        src={BG_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.05]">
          Advertising decisions,
          <br />
          <span className="text-white/70">finally made simple</span>
        </h1>

        <p className="mt-8 max-w-2xl text-base md:text-lg text-white/70 tracking-tight leading-relaxed">
          For small, medium and large businesses — AdsConnect guides you to the right
          <br />
          channels, influencers and local media, with confidence at every step.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/how-it-works"
            className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium tracking-tight hover:bg-white/90 transition-colors"
          >
            See how it works
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            to="/channels"
            className="inline-flex items-center rounded-full border border-white/20 text-white px-6 py-3 text-sm font-medium tracking-tight hover:bg-white/5 transition-colors"
          >
            Explore channels
          </Link>
        </div>
      </div>
      </section>

      <section className="relative z-10 px-6 md:px-10 py-24 md:py-32 border-t border-white/10">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">Every business asks</p>
          <h2 className="mt-4 text-3xl md:text-5xl font-medium tracking-tight leading-[1.1] max-w-3xl">
            The questions you've already been losing sleep over.
          </h2>
          <div className="mt-14 grid gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden md:grid-cols-2">
            {[
              { q: "How do I get more customers?", a: "Start with who you want to reach. AdsConnect maps your audience to the channels that actually move them." },
              { q: "Where should I advertise?", a: "Search, social, out-of-home, podcast, local press — we rank the mix by fit, reach and cost for your goal." },
              { q: "Which influencer should I choose?", a: "Audience overlap, authenticity and past performance — compared side by side, not guessed from follower counts." },
              { q: "Is a billboard worth it?", a: "We model footfall, frequency and brand lift against your budget so you know before you sign." },
              { q: "Which local media works best?", a: "Regional radio, community papers, neighborhood newsletters — benchmarked by city and category." },
              { q: "How do I know it's working?", a: "Clear, plain-language reporting that ties spend to outcomes — no vanity metrics." },
            ].map((item) => (
              <div key={item.q} className="bg-black p-7 md:p-9">
                <h3 className="text-lg md:text-xl font-medium tracking-tight text-white">{item.q}</h3>
                <p className="mt-3 text-sm md:text-base text-white/65 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link to="/faq" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm tracking-tight">
              Read the full FAQ
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 md:px-10 py-24 border-t border-white/10">
        <div className="mx-auto max-w-5xl grid gap-10 md:grid-cols-3">
          {[
            { k: "Small business", v: "Make every marketing dollar count with channels matched to your neighborhood and niche." },
            { k: "Mid-market", v: "Scale beyond your first wins with a balanced mix of digital, influencer and traditional media." },
            { k: "Enterprise", v: "Coordinate national campaigns across thousands of placements with one source of truth." },
          ].map((s) => (
            <div key={s.k}>
              <p className="text-sm uppercase tracking-[0.18em] text-white/50">{s.k}</p>
              <p className="mt-3 text-lg text-white/85 leading-relaxed tracking-tight">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 px-6 md:px-10 py-10 border-t border-white/10 text-sm text-white/50 flex flex-wrap items-center justify-between gap-4">
        <span>© {new Date().getFullYear()} AdsConnect</span>
        <span>Advertising clarity for every business.</span>
      </footer>
    </main>
  );
}
