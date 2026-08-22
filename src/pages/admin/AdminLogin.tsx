import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function AdminLogin() {
  const { hasAdmin, login, setup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (hasAdmin) {
        await login(username, password);
      } else {
        await setup(username, password);
      }
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors duration-200 hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-4" />
          На главную
        </Link>
        <h1 className="text-xl font-semibold text-center">
          {hasAdmin ? "Вход в админку" : "Создание администратора"}
        </h1>
        <p className="mt-3 text-center text-sm text-muted">
          {hasAdmin
            ? "Введите логин и пароль"
            : "Первый запуск. Создайте логин и пароль администратора."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="admin-user" className="text-sm font-medium">
              Логин
            </label>
            <input
              id="admin-user"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="admin-pass" className="text-sm font-medium">
              Пароль
            </label>
            <input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={hasAdmin ? "current-password" : "new-password"}
              required
              minLength={6}
              className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-[filter] duration-200 hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Подождите…" : hasAdmin ? "Войти" : "Создать и войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
