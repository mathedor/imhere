import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}

export function Logo({ className, showWordmark = true, size = 36 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="text-[1.35rem] font-black tracking-tight text-text">
            I&apos;m <span className="text-brand">Here</span>
          </span>
          <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-muted">
            check-in social
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * LogoMark — pin com globo, paleta branco/vermelho com halo branco externo
 * que garante contraste sobre fundo escuro OU claro.
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.24}
      viewBox="0 0 100 124"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="I'm Here"
    >
      <defs>
        <radialGradient id="pinGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ff5a65" />
          <stop offset="55%" stopColor="#ef2c39" />
          <stop offset="100%" stopColor="#b41822" />
        </radialGradient>
        <radialGradient id="pinShine" cx="35%" cy="30%" r="35%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="pinShadow" x="-30%" y="-10%" width="160%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#ef2c39" floodOpacity="0.55" />
        </filter>
      </defs>
      <g filter="url(#pinShadow)">
        {/* Halo branco externo — garante contraste em qualquer fundo */}
        <path
          d="M50 0C23.5 0 2 21.5 2 48c0 35.5 41.6 72.5 44.9 75.4 1.7 1.5 4.5 1.5 6.2 0C56.4 120.5 98 83.5 98 48 98 21.5 76.5 0 50 0Z"
          fill="#ffffff"
          opacity="0.96"
        />
        {/* Pin vermelho gradient */}
        <path
          d="M50 4C25.7 4 6 23.7 6 48c0 33 38.5 67.3 41.6 70.1 1.4 1.2 3.4 1.2 4.8 0C55.5 115.3 94 81 94 48 94 23.7 74.3 4 50 4Z"
          fill="url(#pinGrad)"
        />
        <path
          d="M50 4C25.7 4 6 23.7 6 48c0 33 38.5 67.3 41.6 70.1 1.4 1.2 3.4 1.2 4.8 0C55.5 115.3 94 81 94 48 94 23.7 74.3 4 50 4Z"
          fill="url(#pinShine)"
        />
        {/* Círculo branco (globo) */}
        <circle cx="50" cy="46" r="22" fill="#ffffff" />
        {/* Continentes em vermelho da brand pra alto contraste */}
        <path
          d="M30 46c0-11 9-20 20-20s20 9 20 20-9 20-20 20-20-9-20-20Zm20-16c-8.8 0-16 7.2-16 16 0 6 3.4 11.2 8.4 13.9 1.2-3.5 3-7.6 5.2-11.5C49 47 49.9 45 50.3 43c.4 2 1.3 4 2.5 6.1 2.3 4 4.2 8.3 5.3 11.8 5-2.7 8.5-7.9 8.5-13.9 0-8.8-7.2-16-16-16Z"
          fill="#ef2c39"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}
