import { ArrowRight, Home, MapPin } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Logo size={42} />
        </div>

        <div className="relative mb-6">
          <p className="text-[10rem] font-black leading-none tracking-tighter text-text-soft/10 md:text-[14rem]">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-strong via-brand to-brand-soft text-white shadow-glow">
              <MapPin className="size-10" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-text">
          Esse lugar não existe
        </h1>
        <p className="mt-2 text-sm text-text-soft">
          A página que você procura sumiu · ou nunca rolou.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
          >
            <Home className="size-4" />
            Voltar pra home
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-bold text-text hover:border-brand/40"
          >
            Quem está aqui agora?
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
