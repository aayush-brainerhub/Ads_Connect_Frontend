import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Card,
  SearchBar,
  Select,
  Field,
  Button,
  EmptyState,
  Avatar,
  Badge,
  Pagination,
} from "@/components/ui-kit";
import { formatINR, compactNumber } from "@/lib/mock-data";
import { getReferenceData } from "@/data/reference-data";
import { getProviders, initialsFor } from "@/data/providers";
import { Star, MapPin } from "lucide-react";

export const Route = createFileRoute("/app/advertiser/discover")({
  component: DiscoverLayout,
  // Providers, types and cities all come from the Ads_Connect database.
  loader: async () => {
    const [reference, providers] = await Promise.all([getReferenceData(), getProviders()]);
    return { ...reference, providers };
  },
});

function DiscoverLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // If a detail child is matched, render only the Outlet
  if (pathname !== "/app/advertiser/discover") return <Outlet />;
  return <DiscoverList />;
}

function DiscoverList() {
  const { providerTypes, locations, providers } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [city, setCity] = useState("All");
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [minAudience, setMinAudience] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(
    () =>
      providers.filter(
        (p) =>
          (q ? [p.name, p.description, p.type, p.location].some(s => s?.toLowerCase().includes(q.toLowerCase())) : true) &&
          (type === "All" || p.type === type) &&
          (city === "All" || p.location === city) &&
          p.price <= maxPrice &&
          p.audience >= minAudience,
      ),
    [providers, q, type, city, maxPrice, minAudience],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Discover providers</h1>
        <p className="mt-1 text-sm text-white/60">
          Browse and shortlist channels that fit your campaign.
        </p>
      </div>

      <Card>
        <div className="grid md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <SearchBar
              value={q}
              onChange={(v) => {
                setQ(v);
                setPage(1);
              }}
              placeholder="Search providers..."
            />
          </div>
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All types</option>
            {providerTypes.map((t) => (
              <option key={t.id}>{t.name}</option>
            ))}
          </Select>
          <Select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All locations</option>
            {locations.map((l) => (
              <option key={l.id}>{l.city}</option>
            ))}
          </Select>
          <button
            type="button"
            onClick={() => { setQ(""); setType("All"); setCity("All"); setMaxPrice(10000000); setMinAudience(0); setPage(1); }}
            className="rounded-lg border border-white/10 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            Reset filters
          </button>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Field label={`Max price · ${formatINR(maxPrice)}`}>
            <input
              type="range"
              min={5000}
              max={10000000}
              step={50000}
              value={maxPrice}
              onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }}
              className="w-full accent-white"
            />
          </Field>
          <Field label={`Min audience · ${compactNumber(minAudience)}`}>
            <input
              type="range"
              min={0}
              max={300000000}
              step={500000}
              value={minAudience}
              onChange={(e) => { setMinAudience(Number(e.target.value)); setPage(1); }}
              className="w-full accent-white"
            />
          </Field>
        </div>
      </Card>

      {slice.length === 0 ? (
        <EmptyState
          title="No providers match these filters"
          hint="Try widening price or audience ranges."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slice.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar initials={initialsFor(p.name)} size={44} />
                  <div>
                    <p className="text-base font-medium tracking-tight">{p.name}</p>
                    <p className="text-xs text-white/50">
                      {p.category ? `${p.type} · ${p.category}` : p.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-300">
                  <Star size={12} fill="currentColor" />
                  {p.rating}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
                <MapPin size={12} />
                {p.location ?? "No fixed location"}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/40">Price</p>
                  <p>{p.price > 0 ? formatINR(p.price) : "On request"}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/40">Audience</p>
                  <p>{compactNumber(p.audience)}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <Link
                  to="/app/advertiser/discover/$id"
                  params={{ id: p.id }}
                  className="flex-1 text-center rounded-full border border-white/15 px-4 py-2 text-xs hover:bg-white/5"
                >
                  View profile
                </Link>
                <Link
                  to="/app/advertiser/discover/$id"
                  params={{ id: p.id }}
                  search={{ contact: 1 }}
                  className="flex-1 text-center rounded-full bg-white text-black px-4 py-2 text-xs font-medium hover:bg-white/90"
                >
                  Send request
                </Link>
              </div>
              <div className="mt-3">
                <Badge tone="info">{p.type}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
