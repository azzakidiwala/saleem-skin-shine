const stats = [
  { value: "15+", label: "Years Experience" },
  { value: "5.0★", label: "Patient Rating" },
  { value: "40+", label: "Treatments Offered" },
  { value: "2025", label: "Best Clinic North" },
];

export function StatsStrip() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 px-6">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`py-8 text-center ${i > 0 ? "md:border-l border-border" : ""} ${i % 2 === 1 ? "border-l md:border-l" : ""}`}
          >
            <div className="font-display text-3xl md:text-4xl font-semibold text-gradient-gold">{s.value}</div>
            <div className="mt-1 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
