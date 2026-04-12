export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-3.5 h-3.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }}></span>
        <span className="w-3.5 h-3.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }}></span>
        <span className="w-3.5 h-3.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }}></span>
      </div>
      <p className="text-[var(--text3)] text-xs uppercase tracking-[0.2em] font-semibold">Cargando catálogo...</p>
    </div>
  );
}
