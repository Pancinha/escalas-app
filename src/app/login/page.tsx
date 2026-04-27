"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CalendarCheck, Users2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function EssencyalMark({ size = "lg" }: { size?: "sm" | "lg" }) {
  const isLg = size === "lg";
  return (
    <div className="select-none">
      <p
        className="font-semibold uppercase tracking-[0.4em] text-blue-300"
        style={{ fontSize: isLg ? "11px" : "9px" }}
      >
        SISTEMAS
      </p>
      <h1
        className="font-black italic leading-none text-red-500"
        style={{
          fontSize: isLg ? "3.5rem" : "2rem",
          textShadow: "3px 3px 8px rgba(0,0,0,0.5)",
          fontFamily: "Arial Black, Arial, sans-serif",
        }}
      >
        Essencyal
      </h1>
      <div className="flex items-center gap-1 mt-1">
        <svg
          width={isLg ? 130 : 80}
          height={isLg ? 20 : 13}
          viewBox="0 0 130 20"
          fill="none"
        >
          <path
            d="M5,10 C30,3 55,3 75,10 C95,17 115,17 125,10"
            stroke="url(#wg)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B7CC8" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>
          </defs>
        </svg>
        <span
          className="font-bold text-white ml-0.5"
          style={{ fontSize: isLg ? "1.5rem" : "0.9rem" }}
        >
          ESCALAS
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("E-mail ou senha incorretos. Verifique suas credenciais.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Painel esquerdo — Marca ── */}
      <div
        className="hidden lg:flex w-[58%] flex-col justify-between relative overflow-hidden"
        style={{ backgroundColor: "#07104B" }}
      >
        {/* Círculos decorativos de fundo */}
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(74,124,199,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-40 -left-20 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(204,15,30,0.12) 0%, transparent 70%)" }}
        />

        {/* Topo — badge do sistema */}
        <div className="relative z-10 p-12">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase"
            style={{ background: "rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.7)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Sistema de Escalas · Exclusivo Essencyal
          </span>
        </div>

        {/* Centro — Marca + tagline + features */}
        <div className="relative z-10 px-16">
          <EssencyalMark size="lg" />

          <p
            className="mt-8 text-base leading-relaxed font-light max-w-xs"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Controle total de escalas, ocorrências e cobertura de setores para toda a equipe.
          </p>

          {/* Features */}
          <div className="mt-10 space-y-4">
            {[
              { icon: CalendarCheck, text: "Escalas mensais por unidade e setor" },
              { icon: Users2, text: "Registro de ausências e ocorrências" },
              { icon: ShieldCheck, text: "Cobertura mínima de setor em tempo real" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <Icon className="h-4 w-4 text-red-400" />
                </div>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé — Onda decorativa */}
        <div className="relative z-10 mt-16">
          <svg viewBox="0 0 1440 110" className="w-full" preserveAspectRatio="none">
            <path
              d="M0,55 C240,95 480,15 720,55 C960,95 1200,15 1440,55 L1440,110 L0,110 Z"
              fill="rgba(255,255,255,0.04)"
            />
            <path
              d="M0,75 C360,15 720,95 1080,35 C1260,5 1380,55 1440,75 L1440,110 L0,110 Z"
              fill="rgba(255,255,255,0.03)"
            />
          </svg>
          <div
            className="absolute bottom-0 left-0 right-0 py-4 px-12 text-xs"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            © {new Date().getFullYear()} Essencyal Farma · Todos os direitos reservados
          </div>
        </div>
      </div>

      {/* ── Painel direito — Formulário ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Marca mobile */}
          <div
            className="mb-8 flex flex-col items-center rounded-2xl py-8 px-6 lg:hidden"
            style={{ backgroundColor: "#07104B" }}
          >
            <EssencyalMark size="sm" />
          </div>

          {/* Título */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900">Acesso ao Sistema</h2>
            <p className="mt-1 text-sm text-gray-500">
              Entre com seu e-mail e senha para continuar
            </p>
          </div>

          {/* Card do formulário */}
          <div className="rounded-2xl border border-gray-200 bg-white px-8 py-7 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                style={{
                  backgroundColor: "#07104B",
                  boxShadow: "0 2px 8px rgba(7,16,75,0.3)",
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#0D1A6B"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#07104B"; }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Acesso restrito a colaboradores autorizados da Essencyal Farma
          </p>
        </div>
      </div>

    </div>
  );
}
