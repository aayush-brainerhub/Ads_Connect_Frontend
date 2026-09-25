import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Users, Briefcase, Megaphone, BarChart3, DollarSign, ShieldAlert, Database } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { requireRole } from "@/lib/auth-guard";
import { getMyProfile } from "@/data/profile";

export const Route = createFileRoute("/app/admin")({
  // Returning the session re-declares it non-nullable for every route below.
  beforeLoad: ({ context, location }) => ({
    session: requireRole(context.session, "Admin", location.href),
  }),
  loader: async () => {
    const profile = await getMyProfile();
    return { avatarUrl: profile.user?.profileImageUrl };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { session } = Route.useRouteContext();
  const { avatarUrl } = Route.useLoaderData();

  return (
    <AppShell
      title="Admin"
      session={session}
      avatarUrl={avatarUrl}
      nav={[
        { to: "/app/admin", label: "Dashboard", icon: <LayoutDashboard size={16} />, exact: true },
        { to: "/app/admin/users", label: "Users", icon: <Users size={16} /> },
        { to: "/app/admin/providers", label: "Providers", icon: <Briefcase size={16} /> },
        { to: "/app/admin/campaigns", label: "Campaigns", icon: <Megaphone size={16} /> },
        { to: "/app/admin/finance", label: "Finance & Invoices", icon: <DollarSign size={16} /> },
        { to: "/app/admin/audit", label: "Audit & Trust", icon: <ShieldAlert size={16} /> },
        { to: "/app/admin/lookups", label: "Master Lookups", icon: <Database size={16} /> },
        { to: "/app/admin/reports", label: "Reports", icon: <BarChart3 size={16} /> },
      ]}
    />
  );
}
