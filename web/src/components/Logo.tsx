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
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#ef2c39" floodOpacity="0.45" />
        </filter>
      </defs>
      <g filter="url(#pinShadow)">
        <path
          d="M50 4C25.7 4 6 23.7 6 48c0 33 38.5 67.3 41.6 70.1 1.4 1.2 3.4 1.2 4.8 0C55.5 115.3 94 81 94 48 94 23.7 74.3 4 50 4Z"
          fill="url(#pinGrad)"
        />
        <path
          d="M50 4C25.7 4 6 23.7 6 48c0 33 38.5 67.3 41.6 70.1 1.4 1.2 3.4 1.2 4.8 0C55.5 115.3 94 81 94 48 94 23.7 74.3 4 50 4Z"
          fill="url(#pinShine)"
        />
        <circle cx="50" cy="46" r="22" fill="#f5f5f7" />
        <path
          d="M30 46c0-11 9-20 20-20s20 9 20 20-9 20-20 20-20-9-20-20Zm20-16c-8.8 0-16 7.2-16 16 0 6 3.4 11.2 8.4 13.9 1.2-3.5 3-7.6 5.2-11.5C49 47 49.9 45 50.3 43c.4 2 1.3 4 2.5 6.1 2.3 4 4.2 8.3 5.3 11.8 5-2.7 8.5-7.9 8.5-13.9 0-8.8-7.2-16-16-16Z"
          fill="#5a5a66"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}
