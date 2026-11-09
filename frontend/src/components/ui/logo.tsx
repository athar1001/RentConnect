import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  href?: '/' | '/app';
  noLink?: boolean;
}

export function Logo({ className, iconClassName, textClassName, href = '/', noLink = false }: LogoProps) {
  const content = (
    <>
      <svg
        viewBox="0 0 100 100"
        className={cn("w-12 h-12 shrink-0", iconClassName)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chimney */}
        <rect x="72" y="18" width="12" height="18" fill="#0f172a" rx="1" />
        
        {/* Roof */}
        <path
          d="M 5,42 L 50,14 L 95,42"
          stroke="#0f172a"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* House Body */}
        <path
          d="M 18,36 L 18,80 C 18,84.4 21.6,88 26,88 L 74,88 C 78.4,88 82,84.4 82,80 L 82,66"
          stroke="#0f172a"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 82,36 L 82,44"
          stroke="#0f172a"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Horizontal text lines */}
        <line x1="28" y1="42" x2="68" y2="42" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <line x1="28" y1="50" x2="68" y2="50" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <line x1="28" y1="58" x2="58" y2="58" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

        {/* Checkmark */}
        <path
          d="M 44,64 L 54,74 L 88,40"
          stroke="#2563eb"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={cn("text-xl font-bold tracking-tight text-gray-900", textClassName)}>
        WohnBoard
      </span>
    </>
  );

  if (noLink) {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={cn("flex items-center gap-2.5 hover:opacity-90 transition-opacity", className)}>
      {content}
    </Link>
  );
}
