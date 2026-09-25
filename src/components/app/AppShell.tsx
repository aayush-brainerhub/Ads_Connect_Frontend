import { ReactNode, useState } from "react";
import { Link, Outlet, useRouterState, useNavigate, useRouter } from "@tanstack/react-router";
import { LogOut, Menu, X, Bell } from "lucide-react";
import { Avatar, Modal, Button } from "@/components/ui-kit";
import { signOut as signOutFn } from "@/data/auth";
import { initialsFor, primaryRole, type SessionUser } from "@/lib/auth";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
}

/**
 * `session` comes from the layout route's context rather than being read here:
 * the token lives in an httpOnly cookie, so the browser cannot see who is signed
 * in — only the server can, and it hands the answer down through route context.
 */
export function AppShell({ nav, title, session, avatarUrl }: { nav: NavItem[]; title: string; session: SessionUser; avatarUrl?: string | null }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();

  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const isActive = (n: NavItem) => (n.exact ? pathname === n.to : pathname === n.to || pathname.startsWith(n.to + "/"));

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    await signOutFn();
    // Drops the now-stale session from route context before the sign-in page's
    // own guard runs, which would otherwise bounce straight back here.
    await router.invalidate();
    navigate({ to: "/auth/login" });
  };

  return (
    <div className="flex min-h-screen w-full bg-black text-white">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-white/10 bg-[#070707]">
        <Link to="/" className="px-6 py-5 text-lg font-semibold tracking-tight">
          Ads<span className="text-white/60">Connect</span>
        </Link>
        <div className="px-3 pb-3 text-[11px] uppercase tracking-[0.18em] text-white/40 px-6">{title}</div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm tracking-tight transition-colors " +
                (isActive(n) ? "bg-white text-black" : "text-white/70 hover:text-white hover:bg-white/5")
              }
            >
              {n.icon}
              {n.label}
            </Link>
          ))}
        </nav>
        <button onClick={() => setShowSignOutModal(true)} className="m-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white">
          <LogOut size={16} /> Sign out
        </button>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#070707] border-r border-white/10 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-lg font-semibold">Ads<span className="text-white/60">Connect</span></span>
              <button onClick={() => setOpen(false)}><X size={20} /></button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                  className={"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm " + (isActive(n) ? "bg-white text-black" : "text-white/70 hover:bg-white/5")}>
                  {n.icon}{n.label}
                </Link>
              ))}
            </nav>
            <button onClick={signOut} className="m-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5">
              <LogOut size={16} /> Sign out
            </button>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setOpen(true)}><Menu size={20} /></button>
            <span className="text-sm text-white/60">{title}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white/60 hover:text-white"><Bell size={18} /></button>
            <div className="flex items-center gap-3">
              <Avatar initials={initialsFor(session.name)} size={32} src={avatarUrl} />
              <div className="hidden sm:block text-right">
                <p className="text-sm leading-tight">{session.name}</p>
                <p className="text-[11px] text-white/50 leading-tight">{primaryRole(session)}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8">
          <Outlet />
        </main>
      </div>

      <Modal
        open={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title="Sign Out"
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setShowSignOutModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmSignOut}>
              Sign out
            </Button>
          </div>
        }
      >
        <p className="text-white/70">Are you sure you want to sign out of your account?</p>
      </Modal>
    </div>
  );
}