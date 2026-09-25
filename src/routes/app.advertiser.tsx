import { createFileRoute, redirect } from "@tanstack/react-router";
import { LayoutDashboard, Search, Megaphone, MessageSquare, User, CalendarCheck, Receipt, Star } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { requireRole } from "@/lib/auth-guard";
import { getMyProfile } from "@/data/profile";

export const Route = createFileRoute("/app/advertiser")({
  // Guards the whole advertiser area, loaders included. Returning the session
  // re-declares it non-nullable for every route below, so they can read it
  // without repeating the null check the guard already made.
  beforeLoad: ({ context, location }) => ({
    session: requireRole(context.session, "Advertiser", location.href),
  }),
  loader: async () => {
    const profile = await getMyProfile();
    if (!profile.advertiser) {
      throw redirect({ to: "/onboarding/advertiser" });
    }
    return { avatarUrl: profile.user?.profileImageUrl };
  },
  component: AdvertiserLayout,
});

function AdvertiserLayout() {
  const { session } = Route.useRouteContext();
  const { avatarUrl } = Route.useLoaderData();

  return (
    <AppShell
      title="Advertiser"
      session={session}
      avatarUrl={avatarUrl}
      nav={[
        {
          to: "/app/advertiser",
          label: "Dashboard",
          icon: <LayoutDashboard size={16} />,
          exact: true,
        },
        { to: "/app/advertiser/discover", label: "Discover Providers", icon: <Search size={16} /> },
        {
          to: "/app/advertiser/campaigns",
          label: "Campaigns",
          icon: <Megaphone size={16} />,
        },
        {
          to: "/app/advertiser/bookings",
          label: "Proposals & Bookings",
          icon: <CalendarCheck size={16} />,
        },
        {
          to: "/app/advertiser/billing",
          label: "Billing & Invoices",
          icon: <Receipt size={16} />,
        },
        { to: "/app/advertiser/reviews", label: "Reviews & Ratings", icon: <Star size={16} /> },
        { to: "/app/advertiser/messages", label: "Messages", icon: <MessageSquare size={16} /> },
        { to: "/app/advertiser/profile", label: "Profile", icon: <User size={16} /> },
      ]}
    />
  );
}
