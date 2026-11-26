interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function BrandLogo({ className = '', showWordmark = true }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="vb-grad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        {/* Chat bubble body */}
        <path
          d="M7 6.5C4.51472 6.5 2.5 8.51472 2.5 11V24.5C2.5 26.9853 4.51472 29 7 29H10.5V33.2C10.5 33.65 11.04 33.88 11.36 33.56L15.9 29H29C31.4853 29 33.5 26.9853 33.5 24.5V11C33.5 8.51472 31.4853 6.5 29 6.5H7Z"
          fill="url(#vb-grad)"
        />
        {/* Subtle globe meridian arcs */}
        <circle cx="18" cy="18" r="8.2" stroke="white" strokeOpacity="0.28" strokeWidth="1.2" />
        <ellipse cx="18" cy="18" rx="4.2" ry="8.2" stroke="white" strokeOpacity="0.28" strokeWidth="1.1" />
        {/* Graduation cap */}
        <path d="M18 11.8L26.2 15.6L18 19.4L9.8 15.6L18 11.8Z" fill="white" />
        <path
          d="M13.3 18.2V21.7C13.3 22.9 15.4 23.9 18 23.9C20.6 23.9 22.7 22.9 22.7 21.7V18.2L18 20.4L13.3 18.2Z"
          fill="white"
          fillOpacity="0.92"
        />
        <path d="M25 16.3V21.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          VisaBuddy <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">AI</span>
        </span>
      )}
    </span>
  );
}
