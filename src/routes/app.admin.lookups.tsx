import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Table, Badge, SearchBar, Button, Modal, Field, Input, Textarea } from "@/components/ui-kit";
import {
  getLookupsBundle,
  createLookupItem,
  toggleLookupStatus,
  type LookupsBundle,
  type LookupItem,
} from "@/data/lookups";
import { Plus, Database, Tag, MapPin, Tv, Layers, ShieldCheck, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/app/admin/lookups")({
  component: AdminLookupsPage,
  loader: () => getLookupsBundle(),
});

type LookupCategory = "industries" | "locations" | "providerTypes" | "channels" | "pricingUnits" | "roles";

export function AdminLookupsPage() {
  const initialBundle = Route.useLoaderData();
  const router = useRouter();
  const [category, setCategory] = useState<LookupCategory>("channels");
  const [q, setQ] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemCode, setNewItemCode] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemState, setNewItemState] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const term = q.trim().toLowerCase();

  const currentList = initialBundle[category] || [];
  const filteredList = currentList.filter((item) =>
    term
      ? item.name.toLowerCase().includes(term) ||
        (item.code && item.code.toLowerCase().includes(term)) ||
        (item.category && item.category.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term))
      : true,
  );

  const handleToggleStatus = async (id: string) => {
    setBusyItemId(id);
    setErrorMessage(null);
    try {
      const res = await toggleLookupStatus({
        data: {
          category,
          id,
        },
      });
      if (res && !res.success) {
        setErrorMessage(res.errMessage || "Failed to update item status.");
      } else {
        await router.invalidate();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle status.";
      setErrorMessage(msg);
    } finally {
      setBusyItemId(null);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await createLookupItem({
        data: {
          category,
          name: newItemName.trim(),
          subCategory: newItemCategory.trim() || undefined,
          code: newItemCode.trim() || undefined,
          description: newItemDescription.trim() || undefined,
          state: newItemState.trim() || undefined,
        },
      });

      if (res && !res.success) {
        setErrorMessage(res.errMessage || "Failed to create lookup entry.");
        setIsSubmitting(false);
        return;
      }

      setNewItemName("");
      setNewItemCategory("");
      setNewItemCode("");
      setNewItemDescription("");
      setNewItemState("");
      setShowAddModal(false);
      await router.invalidate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create lookup entry.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryIcons = {
    channels: <Tv size={16} />,
    industries: <Tag size={16} />,
    locations: <MapPin size={16} />,
    providerTypes: <Layers size={16} />,
    pricingUnits: <Database size={16} />,
    roles: <ShieldCheck size={16} />,
  };

  const singularLabels: Record<LookupCategory, string> = {
    channels: "Channel",
    industries: "Industry",
    locations: "Location",
    providerTypes: "Provider Type",
    pricingUnits: "Pricing Unit",
    roles: "Role",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white">Master Lookups & Taxonomy</h1>
          <p className="text-sm text-white/60">
            Configure system lookup tables for seed reference data, taxonomy channels, locations, and pricing models.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="sm">
          <Plus size={16} /> Add {singularLabels[category]}
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Category Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {(
          [
            { id: "channels", label: "Channels", count: initialBundle.channels.length },
            { id: "industries", label: "Industries", count: initialBundle.industries.length },
            { id: "locations", label: "Locations", count: initialBundle.locations.length },
            { id: "providerTypes", label: "Provider Types", count: initialBundle.providerTypes.length },
            { id: "pricingUnits", label: "Pricing Units", count: initialBundle.pricingUnits.length },
            { id: "roles", label: "User Roles", count: initialBundle.roles.length },
          ] as { id: LookupCategory; label: string; count: number }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setCategory(tab.id);
              setQ("");
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs transition-all ${
              category === tab.id
                ? "border-white bg-white/10 text-white font-medium shadow-md"
                : "border-white/5 bg-white/[0.02] text-white/60 hover:border-white/15 hover:text-white"
            }`}
          >
            <span className="text-white/70">{categoryIcons[tab.id]}</span>
            <div className="truncate">
              <div>{tab.label}</div>
              <div className="text-[11px] text-white/40">{tab.count} items</div>
            </div>
          </button>
        ))}
      </div>

      {/* Search Filter */}
      <div className="max-w-md">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={`Search ${category} by title, code or tags...`}
        />
      </div>

      {/* Lookup Table */}
      <Card>
        <Table<LookupItem>
          columns={[
            {
              key: "name",
              label: "Item Name",
              render: (r) => (
                <div>
                  <span className="font-medium text-white">{r.name}</span>
                  {r.code && <span className="ml-2 font-mono text-[11px] text-white/40">({r.code})</span>}
                  {r.description && <div className="text-xs text-white/40 mt-0.5">{r.description}</div>}
                </div>
              ),
            },
            ...(category === "channels"
              ? [
                  {
                    key: "category",
                    label: "Channel Category",
                    render: (r: LookupItem) => <Badge tone="info">{r.category ?? "General"}</Badge>,
                  },
                ]
              : []),
            {
              key: "itemCount",
              label: "Active Links",
              render: (r) => (
                <span className="text-xs text-white/70 bg-white/5 px-2 py-1 rounded">
                  {r.itemCount ?? 0} references
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <Badge tone={r.isActive ? "success" : "danger"}>
                  {r.isActive ? "Active" : "Disabled"}
                </Badge>
              ),
            },
            {
              key: "actions",
              label: "Action",
              render: (r) => (
                <Button
                  size="sm"
                  disabled={busyItemId === r.id}
                  variant={r.isActive ? "danger" : "secondary"}
                  onClick={() => handleToggleStatus(r.id)}
                >
                  {busyItemId === r.id ? "Updating..." : r.isActive ? "Disable" : "Enable"}
                </Button>
              ),
            },
          ]}
          rows={filteredList}
          empty={term ? "No items matching search." : `No ${category} configured.`}
        />
      </Card>

      {/* Add Item Modal */}
      {showAddModal && (
        <Modal
          open={true}
          onClose={() => !isSubmitting && setShowAddModal(false)}
          title={`Add New ${singularLabels[category]}`}
          footer={
            <>
              <Button variant="ghost" disabled={isSubmitting} onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={isSubmitting} onClick={handleAddItem}>
                {isSubmitting ? "Creating..." : "Create Entry"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddItem} className="space-y-4">
            <Field label="Display Name">
              <Input
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={
                  category === "locations"
                    ? "e.g. Mumbai, Bengaluru"
                    : category === "channels"
                    ? "e.g. Instagram Reels, Metro Station DOOH"
                    : "e.g. Name of entry"
                }
              />
            </Field>

            {category === "locations" && (
              <Field label="State / Province">
                <Input
                  value={newItemState}
                  onChange={(e) => setNewItemState(e.target.value)}
                  placeholder="e.g. Maharashtra, Karnataka"
                />
              </Field>
            )}

            {category === "channels" && (
              <Field label="Category Group">
                <Input
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  placeholder="e.g. Social Media, Video, DOOH Billboard, Transit"
                />
              </Field>
            )}

            {category === "pricingUnits" && (
              <Field label="Machine Code">
                <Input
                  value={newItemCode}
                  onChange={(e) => setNewItemCode(e.target.value)}
                  placeholder="e.g. cpm, per_post, flat_monthly"
                />
              </Field>
            )}

            <Field label="Description (Optional)">
              <Textarea
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Optional description or contextual note..."
              />
            </Field>
          </form>
        </Modal>
      )}
    </div>
  );
}
