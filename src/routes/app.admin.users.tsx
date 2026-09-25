import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Card, Table, Badge, SearchBar, Button, Modal } from "@/components/ui-kit";
import { useState } from "react";
import { getAdminUsers, approveProvider, type AdminUser } from "@/data/admin";

export const Route = createFileRoute("/app/admin/users")({
  component: UsersPage,
  loader: () => getAdminUsers(),
});

function UsersPage() {
  const users = Route.useLoaderData();
  const [q, setQ] = useState("");
  const router = useRouter();
  const [providerToApprove, setProviderToApprove] = useState<string | null>(null);

  // Filtered client-side: the whole list is already here, and the endpoint's
  // `search` parameter is there for when it stops fitting in one response.
  const term = q.trim().toLowerCase();
  const rows = term
    ? users.filter(
        (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
      )
    : users;

  const handleApprove = async (userId: string) => {
    setProviderToApprove(userId);
  };

  const confirmApprove = async () => {
    if (!providerToApprove) return;
    const userId = providerToApprove;
    setProviderToApprove(null);
    await approveProvider({ data: userId });
    await router.invalidate();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium tracking-tight">Users</h1>
      <Card>
        <div className="mb-4 max-w-sm">
          <SearchBar value={q} onChange={setQ} placeholder="Search users..." />
        </div>
        <Table<AdminUser>
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            {
              key: "role",
              label: "Role",
              render: (r) =>
                r.role ? (
                  <Badge tone="info">{r.role}</Badge>
                ) : (
                  <span className="text-white/40">—</span>
                ),
            },
            { key: "joined", label: "Joined" },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <Badge tone={r.status === "Active" ? "success" : "danger"}>{r.status}</Badge>
              ),
            },
            {
              key: "actions",
              label: "",
              render: (r) =>
                r.status !== "Active" && r.role.includes("Provider") ? (
                  <Button variant="primary" size="sm" onClick={() => handleApprove(r.id)}>
                    Approve
                  </Button>
                ) : null,
            },
          ]}
          rows={rows}
          empty={term ? "No users match that search." : "No users yet."}
        />
      </Card>
      
      {providerToApprove && (
        <Modal
          open={true}
          title="Approve Provider"
          onClose={() => setProviderToApprove(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setProviderToApprove(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmApprove}>
                Approve
              </Button>
            </>
          }
        >
          <p className="text-white/70">
            Are you sure you want to approve this provider? They will be granted access to the platform.
          </p>
        </Modal>
      )}
    </div>
  );
}
