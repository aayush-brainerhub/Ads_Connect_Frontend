import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, ButtonHTMLAttributes, TextareaHTMLAttributes, useEffect, useState } from "react";
import { Search, X, Loader2, Inbox, Eye, EyeOff } from "lucide-react";

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-sm",
  }[size];
  const variants = {
    primary: "bg-white text-black hover:bg-white/90",
    secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
    ghost: "text-white/80 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/90 text-white hover:bg-red-500",
  }[variant];
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors disabled:opacity-50 disabled:pointer-events-none",
        sizes,
        variants,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx("rounded-2xl border border-white/10 bg-white/[0.03] p-6", className)}>{children}</div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={cx(
        "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-white/30",
        className,
      )}
    />
  );
}

/**
 * A password field with a show/hide toggle.
 *
 * `type` is owned by the toggle, so it is not accepted as a prop. Everything
 * else — `required`, `autoComplete`, `minLength` — passes through to {@link Input}.
 */
export function PasswordInput({
  className,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  const label = visible ? "Hide password" : "Show password";

  return (
    <div className="relative">
      {/* pr-11 keeps the value from running underneath the button. */}
      <Input {...rest} type={visible ? "text" : "password"} className={cx("pr-11", className)} />
      <button
        // Inside a form, a button with no type submits it — which would fire a
        // sign-in attempt every time someone peeked at what they had typed.
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        aria-pressed={visible}
        title={label}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/50 transition-colors hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={cx(
        "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-white/30 min-h-[100px]",
        className,
      )}
    />
  );
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={cx(
        "w-full rounded-lg border border-white/10 bg-black px-3 pr-9 py-2.5 text-sm text-white outline-none transition-colors focus:border-white/30 appearance-none bg-[length:16px_16px] bg-[position:right_10px_center] bg-no-repeat bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.5)%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]",
        className,
      )}
    >
      {children}
    </select>
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs uppercase tracking-[0.14em] text-white/50 mb-2">
      {children}
    </label>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const w = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" }[size];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cx("relative w-full rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl", w)}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="text-base font-medium tracking-tight text-white">{title}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Table<T>({
  columns,
  rows,
  empty = "No data",
}: {
  columns: { key: keyof T | string; label: string; render?: (row: T) => ReactNode; className?: string }[];
  rows: T[];
  empty?: string;
}) {
  if (rows.length === 0) return <EmptyState title={empty} />;
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-white/[0.03] text-white/60">
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)} className={cx("px-4 py-3 text-left font-medium text-xs uppercase tracking-wider whitespace-nowrap", c.className)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
              {columns.map((c) => (
                <td key={String(c.key)} className={cx("px-4 py-3 text-white/85 whitespace-nowrap", c.className)}>
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key as string] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <Button variant="secondary" size="sm" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}>
        Prev
      </Button>
      {Array.from({ length: pages }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={cx(
            "h-8 w-8 rounded-full text-xs",
            page === i + 1 ? "bg-white text-black" : "text-white/70 hover:bg-white/10",
          )}
        >
          {i + 1}
        </button>
      ))}
      <Button variant="secondary" size="sm" onClick={() => onChange(Math.min(pages, page + 1))} disabled={page === pages}>
        Next
      </Button>
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30"
      />
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-6 py-16 text-center">
      <div className="rounded-full bg-white/5 p-4 text-white/50">
        <Inbox size={22} />
      </div>
      <p className="mt-4 text-base text-white/90 tracking-tight">{title}</p>
      {hint && <p className="mt-1 text-sm text-white/50 max-w-sm">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Loader({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-white/60 text-sm">
      <Loader2 size={16} className="animate-spin" />
      {label || "Loading..."}
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warn" | "danger" | "info" }) {
  const tones = {
    default: "bg-white/10 text-white/80",
    success: "bg-emerald-500/15 text-emerald-300",
    warn: "bg-amber-500/15 text-amber-300",
    danger: "bg-red-500/15 text-red-300",
    info: "bg-sky-500/15 text-sky-300",
  }[tone];
  return <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones)}>{children}</span>;
}

export function Avatar({ initials, size = 40, src }: { initials: string; size?: number; src?: string | null }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/5 text-white font-medium tracking-tight border border-white/10 overflow-hidden shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {src ? (
        <img src={src} alt={initials} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}