"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-[var(--accent)] mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-2xl font-[family-name:var(--font-barlow-condensed)] font-bold mb-2 tracking-wide uppercase">
        ¡Vaya! Hubo un problema
      </h2>
      <p className="text-[var(--text2)] mb-6 max-w-md">
        No pudimos cargar la información. Es posible que sea un fallo de red o que la base de datos se encuentre en pausa.
      </p>
      <button
        onClick={() => reset()}
        className="bg-[var(--accent)] hover:bg-[var(--accent2)] px-6 py-2 rounded text-white font-semibold uppercase tracking-wider text-sm transition-colors cursor-pointer"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
