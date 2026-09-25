import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  Select,
  Table,
  Textarea,
} from "@/components/ui-kit";
import { formatINR } from "@/lib/mock-data";
import { campaignTone } from "@/lib/status";
import { getReferenceData } from "@/data/reference-data";
import { createCampaign, getMyCampaigns, updateCampaign, deleteCampaign, type Campaign } from "@/data/campaigns";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/advertiser/campaigns")({
  component: CampaignsPage,
  loader: async () => {
    const [reference, campaigns] = await Promise.all([getReferenceData(), getMyCampaigns()]);
    return { reference, campaigns };
  },
});

function CampaignsPage() {
  const { reference, campaigns } = Route.useLoaderData();
  const { industries, locations, objectives } = reference;
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const blank = {
    id: "",
    title: "",
    industryId: industries[0]?.id ?? "",
    budget: "",
    locationId: locations[0]?.id ?? "",
    objective: objectives[0] ?? "",
    description: "",
  };
  const [form, setForm] = useState(blank);

  const openEdit = (c: Campaign) => {
    const indId = industries.find((i) => i.name === c.industry)?.id ?? "";
    const locId = locations.find((l) => l.city === c.location)?.id ?? "";
    setForm({
      id: c.id,
      title: c.title,
      industryId: indId,
      locationId: locId,
      budget: c.budget.toString(),
      objective: c.objective,
      description: c.description ?? "",
    });
    setOpen(true);
  };

  const submitForm = async () => {
    setPending(true);
    setError(null);
    try {
      const data = {
        title: form.title,
        industryId: form.industryId || null,
        locationId: form.locationId || null,
        budget: Number(form.budget) || 0,
        objective: form.objective,
        description: form.description || null,
      };
      
      const result = form.id 
        ? await updateCampaign({ data: { ...data, id: form.id } })
        : await createCampaign({ data });
        
      if (!result.ok) {
        setError(result.error ?? `The campaign could not be ${form.id ? 'updated' : 'created'}.`);
        return;
      }
      setOpen(false);
      setForm(blank);
      await router.invalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `The campaign could not be ${form.id ? 'updated' : 'created'}.`);
    } finally {
      setPending(false);
    }
  };

  const performDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const result = await deleteCampaign({ data: deleteId });
      if (result.ok) {
        setDeleteId(null);
        await router.invalidate();
      } else {
        alert(result.error ?? "Failed to delete campaign.");
      }
    } catch (e) {
      alert("Failed to delete campaign.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight">Campaign requests</h1>
          <p className="mt-1 text-sm text-white/60">Manage active and draft campaigns.</p>
        </div>
        <Button onClick={() => { setForm(blank); setOpen(true); }} className="shrink-0 whitespace-nowrap">
          <Plus size={14} /> New campaign
        </Button>
      </div>

      <Card>
        <Table<Campaign>
          columns={[
            {
              key: "title",
              label: "Campaign",
              render: (r) => <span className="text-white">{r.title}</span>,
            },
            { key: "industry", label: "Industry", render: (r) => r.industry ?? "—" },
            { key: "location", label: "Location", render: (r) => r.location ?? "—" },
            { key: "budget", label: "Budget", render: (r) => formatINR(r.budget) },
            { key: "objective", label: "Objective" },
            { key: "responses", label: "Responses" },
            {
              key: "status",
              label: "Status",
              render: (r) => <Badge tone={campaignTone(r.status)}>{r.status}</Badge>,
            },
            {
              key: "actions",
              label: "Actions",
              className: "text-right",
              render: (r) => (
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)} title="Edit">
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id)} title="Delete" className="text-red-400 hover:text-red-300">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ),
            },
          ]}
          rows={campaigns}
          empty="No campaigns yet — create your first one."
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "Edit campaign" : "Create campaign"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm} disabled={!form.title || pending}>
              {pending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> {form.id ? 'Saving…' : 'Creating…'}
                </>
              ) : (
                form.id ? 'Save changes' : 'Create'
              )}
            </Button>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Campaign title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Industry">
            <Select
              value={form.industryId}
              onChange={(e) => setForm({ ...form, industryId: e.target.value })}
            >
              {industries.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Budget (₹)">
            <Input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
          </Field>
          <Field label="Location">
            <Select
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.city}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Objective">
            <Select
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
            >
              {objectives.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
          </div>
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

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete campaign"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={performDelete} disabled={deleting}>
              {deleting ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-white/80">Are you sure you want to delete this campaign? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
