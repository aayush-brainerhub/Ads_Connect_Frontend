import { createFileRoute, redirect } from "@tanstack/react-router";
import { LayoutDashboard, Boxes, Megaphone, MessageSquare, User, CalendarCheck, DollarSign, Star } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { requireRole } from "@/lib/auth-guard";
import { getMyProfile } from "@/data/profile";

export const Route = createFileRoute("/app/provider")({
  // Returning the session re-declares it non-nullable for every route below.
  beforeLoad: ({ context, location }) => ({
    session: requireRole(context.session, "Provider", location.href),
  }),
  loader: async () => {
    const profile = await getMyProfile();
    if (!profile.provider) {
      throw redirect({ to: "/onboarding/provider" });
    }
    return { avatarUrl: profile.user?.profileImageUrl };
  },
  component: ProviderLayout,
});

function ProviderLayout() {
  const { session } = Route.useRouteContext();
  const { avatarUrl } = Route.useLoaderData();

  return (
    <AppShell
      title="Provider"
      session={session}
      avatarUrl={avatarUrl}
      nav={[
        {
          to: "/app/provider",
          label: "Dashboard",
          icon: <LayoutDashboard size={16} />,
          exact: true,
        },
        { to: "/app/provider/inventory", label: "My Inventory", icon: <Boxes size={16} /> },
        { to: "/app/provider/requests", label: "Campaign Requests", icon: <Megaphone size={16} /> },
        {
          to: "/app/provider/bookings",
          label: "Proposals & Bookings",
          icon: <CalendarCheck size={16} />,
        },
        {
          to: "/app/provider/finances",
          label: "Earnings & Payouts",
          icon: <DollarSign size={16} />,
        },
        { to: "/app/provider/reviews", label: "Reviews & Ratings", icon: <Star size={16} /> },
        { to: "/app/provider/messages", label: "Messages", icon: <MessageSquare size={16} /> },
        { to: "/app/provider/profile", label: "Profile", icon: <User size={16} /> },
      ]}
    />
  );
}
