import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Field, Input, Modal, Select, Table, Badge } from "@/components/ui-kit";
import { formatINR } from "@/lib/mock-data";
import { inventoryTone } from "@/lib/status";
import { getReferenceData } from "@/data/reference-data";
import {
  deleteInventory,
  getMyInventory,
  saveInventory,
  type InventoryItem,
} from "@/data/inventory";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

/** CK_Inventory_Status also allows Archived, which the Remove button sets. */
const STATUSES = ["Active", "Paused", "Draft"];

export const Route = createFileRoute("/app/provider/inventory")({
  component: InventoryPage,
  loader: async () => {
    const [reference, items] = await Promise.all([getReferenceData(), getMyInventory()]);
    return { reference, items };
  },
});

function InventoryPage() {
  const { reference, items } = Route.useLoaderData();
  // Inventory hangs off an advertising channel, not a provider type — a provider
  // type is what you are, a channel is what you sell.
  const { channels, pricingUnits } = reference;
  const router = useRouter();

  const blank = {
    id: null as string | null,
    name: "",
    channelId: channels[0]?.id ?? "",
    price: "",
    pricingUnitId: pricingUnits.find((u) => u.code === "flat")?.id ?? pricingUnits[0]?.id ?? "",
    status: "Active",
  };

  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setForm(blank);
    setError(null);
    setOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setForm({
      id: item.id,
      name: item.name,
      channelId: item.channelId,
      price: String(item.price),
      pricingUnitId: item.pricingUnitId ?? blank.pricingUnitId,
      status: item.status,
    });
    setError(null);
    setOpen(true);
  };

  const save = async () => {
    setPending(true);
    setError(null);
    try {
      const result = await saveInventory({
        data: {
          id: form.id,
          name: form.name,
          channelId: form.channelId,
          price: Number(form.price) || 0,
          pricingUnitId: form.pricingUnitId,
          status: form.status,
        },
      });
      if (!result.ok) {
        setError(result.error ?? "Could not save.");
        return;
      }
      setOpen(false);
      await router.invalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save.");
    } finally {
      setPending(false);
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      const result = await deleteInventory({ data: id });
      if (!result.ok) {
        setError(result.error ?? "Could not remove.");
        return;
      }
      await router.invalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not remove.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight">My inventory</h1>
          <p className="mt-1 text-sm text-white/60">Add and manage advertising slots you offer.</p>
        </div>
        <Button onClick={openCreate} className="shrink-0 whitespace-nowrap">
          <Plus size={14} /> Add inventory
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <Card>
        <Table<InventoryItem>
          columns={[
            { key: "name", label: "Name" },
            {
              key: "channel",
              label: "Channel",
              render: (r) => <Badge tone="info">{r.channel}</Badge>,
            },
            {
              key: "price",
              label: "Price",
              render: (r) => (
                <span>
                  {formatINR(r.price)}
                  {r.pricingUnit && (
                    <span className="text-white/40 text-xs"> / {r.pricingUnit}</span>
                  )}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => <Badge tone={inventoryTone(r.status)}>{r.status}</Badge>,
            },
            {
              key: "actions",
              label: "",
              render: (r) => (
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEdit(r)}
                    aria-label={`Edit ${r.name}`}
                    className="p-2 rounded-md hover:bg-white/5 text-white/70"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    aria-label={`Remove ${r.name}`}
                    className="p-2 rounded-md hover:bg-white/5 text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
              className: "text-right",
            },
          ]}
          rows={items}
          empty="No inventory yet — add your first slot."
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "Edit inventory" : "Add inventory"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!form.name || pending}>
              {pending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : form.id ? (
                "Save"
              ) : (
                "Create"
              )}
            </Button>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Channel">
            <Select
              value={form.channelId}
              onChange={(e) => setForm({ ...form, channelId: e.target.value })}
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Price (₹)">
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </Field>
          <Field label="Quoted as">
            <Select
              value={form.pricingUnitId}
              onChange={(e) => setForm({ ...form, pricingUnitId: e.target.value })}
            >
              {pricingUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          {error && (
            <p
              role="alert"
              className="sm:col-span-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
