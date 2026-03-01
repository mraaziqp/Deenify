// Logo component for Deenify
"use client";

export default function DeenifyLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 56"
      height="48"
      aria-label="Deenify"
      className="w-auto h-12"
    >
      {/* Open book */}
      <g transform="translate(4, 6)">
        <path d="M22 38 C22 38 10 34 4 36 L4 10 C10 8 22 12 22 12 Z" fill="#0d9488" />
        <path d="M22 38 C22 38 34 34 40 36 L40 10 C34 8 22 12 22 12 Z" fill="#14b8a6" />
        <line x1="22" y1="12" x2="22" y2="38" stroke="#fff" strokeWidth="1.5" />
      </g>
      {/* Crescent */}
      <g transform="translate(37, 4)">
        <path
          d="M10 2 A9 9 0 1 0 10 20 A6 6 0 1 1 10 2 Z"
          fill="#0d9488"
        />
      </g>
      {/* Wordmark */}
      <text
        x="64"
        y="37"
        fontFamily="Georgia, serif"
        fontWeight="700"
        fontSize="26"
        fill="#0d9488"
        letterSpacing="0.5"
      >
        Deenify
      </text>
    </svg>
  );
}
