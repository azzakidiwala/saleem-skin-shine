import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MoveHorizontal } from "lucide-react";

export type BeforeAfterPair = { before: string; after: string; caption?: string };

export function BeforeAfterSlider({ pairs }: { pairs: BeforeAfterPair[] }) {
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const pair = pairs[index];

  const move = useCallback((clientX: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => dragging.current && move(e.clientX);
    const onUp = () => (dragging.current = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [move]);

  if (!pair) return null;

  const go = (dir: number) => {
    setIndex((i) => (i + dir + pairs.length) % pairs.length);
    setPos(50);
  };

  return (
    <div>
      <div
        ref={frameRef}
        className="relative w-full aspect-[4/5] sm:aspect-[4/3] overflow-hidden bg-secondary select-none touch-none cursor-ew-resize"
        onMouseDown={(e) => {
          dragging.current = true;
          move(e.clientX);
        }}
        onTouchMove={(e) => move(e.touches[0].clientX)}
        onTouchStart={(e) => move(e.touches[0].clientX)}
      >
        <img src={pair.after} alt="After treatment" loading="lazy" className="absolute inset-0 h-full w-full object-cover pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${pos}%` }}>
          <img
            src={pair.before}
            alt="Before treatment"
            loading="lazy"
            className="h-full object-cover"
            style={{ width: frameRef.current?.clientWidth ?? "100%", maxWidth: "none" }}
          />
        </div>

        <span className="absolute top-4 left-4 bg-black/60 text-white text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 pointer-events-none">
          Before
        </span>
        <span className="absolute top-4 right-4 bg-gold text-gold-foreground text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 pointer-events-none">
          After
        </span>

        <div className="absolute inset-y-0 w-px bg-white/90 pointer-events-none" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-11 w-11 rounded-full bg-white shadow-lg flex items-center justify-center">
            <MoveHorizontal className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mt-4">
        <p className="text-sm text-muted-foreground">{pair.caption}</p>
        {pairs.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label="Previous result"
              onClick={() => go(-1)}
              className="h-9 w-9 border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {index + 1} / {pairs.length}
            </span>
            <button
              type="button"
              aria-label="Next result"
              onClick={() => go(1)}
              className="h-9 w-9 border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground/70">
        Drag the handle to compare. Individual results vary and are not guaranteed.
      </p>
    </div>
  );
}
