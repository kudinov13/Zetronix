import { type ReactNode } from "react";
import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { LayoutGrid, FolderTree, FileStack, Briefcase, Award, LogOut, ExternalLink, Inbox } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Обзор", icon: LayoutGrid, end: true },
  { to: "/admin/leads", label: "Заявки", icon: Inbox, end: false },
  { to: "/admin/templates", label: "Шаблоны", icon: FileStack, end: false },
  { to: "/admin/categories", label: "Категории", icon: FolderTree, end: false },
  { to: "/admin/cases", label: "Кейсы", icon: Briefcase, end: false },
  { to: "/admin/certificates", label: "Дипломы и сертификаты", icon: Award, end: false },
];

export function AdminLayout() {
  const { username, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <p className="text-muted">Загрузка…</p>
      </div>
    );
  }

  if (!username) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm transition-colors duration-200",
      isActive ? "bg-accent text-accent-foreground" : "text-muted hover:bg-surface hover:text-foreground",
    );

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="flex flex-col md:flex-row">
        <aside className="flex shrink-0 flex-col border-b border-border bg-surface md:min-h-[100dvh] md:w-64 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between px-5 py-4 md:block">
            <Link to="/admin" className="flex items-center gap-2.5 font-display text-sm font-semibold tracking-tight">
              <img src="/favicon.jpg" alt="Zetronix" className="size-7 rounded-lg object-cover" />
              Zetronix
            </Link>
            <p className="mt-2 hidden text-xs text-muted md:block">
              Вы вошли как {username}
            </p>
          </div>

          <nav aria-label="Админ-навигация" className="flex flex-1 flex-col gap-1 p-3">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                <Icon aria-hidden className="size-4" />
                {label}
              </NavLink>
            ))}

            <div className="mt-auto flex flex-col gap-1 pt-4">
              <Link
                to="/"
                target="_blank"
                className="flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm text-muted transition-colors duration-200 hover:bg-surface hover:text-foreground"
              >
                <ExternalLink aria-hidden className="size-4" />
                Открыть сайт
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-4 text-sm text-muted transition-colors duration-200 hover:bg-surface hover:text-foreground"
              >
                <LogOut aria-hidden className="size-4" />
                Выйти
              </button>
            </div>
          </nav>
        </aside>

        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function AdminLayoutPlaceholder({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
