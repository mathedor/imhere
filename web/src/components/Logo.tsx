import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: number;
  /** Wordmark menor, sem subtitle — pra usar em headers */
  compact?: boolean;
}

export function Logo({ className, showWordmark = true, size = 36, compact = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "logo-wordmark font-black tracking-tight",
              compact ? "text-xl" : "text-[1.6rem]"
            )}
            style={{ fontWeight: 900, letterSpacing: "-0.02em" }}
          >
            I&apos;m <span className="logo-wordmark-brand">Here</span>
          </span>
          {!compact && (
            <span className="logo-wordmark-soft mt-0.5 text-[0.6rem] font-bold uppercase tracking-[0.22em]">
              check-in social
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * LogoMark — pin geo com globo. Cores fixas pra garantir contraste:
 *   - Pin: gradient vermelho (#ff6b75 → #a01620)
 *   - Globo (círculo): branco sólido
 *   - Continentes: vermelho da brand
 *   - Borda escura sutil pro pin se destacar em fundos claros
 *
 * Funciona em DARK e LIGHT mode sem depender de variáveis.
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  const gradId = `pinGrad-${size}`;
  const shineId = `pinShine-${size}`;
  const shadowId = `pinShadow-${size}`;

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
        <radialGradient id={gradId} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ff6b75" />
          <stop offset="55%" stopColor="#ef2c39" />
          <stop offset="100%" stopColor="#a01620" />
        </radialGradient>
        <radialGradient id={shineId} cx="35%" cy="30%" r="35%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id={shadowId} x="-30%" y="-10%" width="160%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#ef2c39" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <path
          d="M50 4C25.7 4 6 23.7 6 48c0 33 38.5 67.3 41.6 70.1 1.4 1.2 3.4 1.2 4.8 0C55.5 115.3 94 81 94 48 94 23.7 74.3 4 50 4Z"
          fill={`url(#${gradId})`}
        />
        <path
          d="M50 4C25.7 4 6 23.7 6 48c0 33 38.5 67.3 41.6 70.1 1.4 1.2 3.4 1.2 4.8 0C55.5 115.3 94 81 94 48 94 23.7 74.3 4 50 4Z"
          fill={`url(#${shineId})`}
        />
        <path
          d="M50 4C25.7 4 6 23.7 6 48c0 33 38.5 67.3 41.6 70.1 1.4 1.2 3.4 1.2 4.8 0C55.5 115.3 94 81 94 48 94 23.7 74.3 4 50 4Z"
          fill="none"
          stroke="#7a0d15"
          strokeWidth="1"
          strokeOpacity="0.35"
        />
        <circle cx="50" cy="46" r="22" fill="#ffffff" />
        <path
          d="M30 46c0-11 9-20 20-20s20 9 20 20-9 20-20 20-20-9-20-20Zm20-16c-8.8 0-16 7.2-16 16 0 6 3.4 11.2 8.4 13.9 1.2-3.5 3-7.6 5.2-11.5C49 47 49.9 45 50.3 43c.4 2 1.3 4 2.5 6.1 2.3 4 4.2 8.3 5.3 11.8 5-2.7 8.5-7.9 8.5-13.9 0-8.8-7.2-16-16-16Z"
          fill="#ef2c39"
          opacity="0.92"
        />
      </g>
    </svg>
  );
}
