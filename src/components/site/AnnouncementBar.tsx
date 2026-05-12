import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { useSiteContent, getArray } from "@/lib/content/queries";

const fallback = [
  "Best Aesthetics Clinic North 2025",
  "Award-Winning Specialists · 5★ Rated by 14+ Patients",
  "Free Skin Consultation · Book Today",
];

export function AnnouncementBar() {
  const { data: content } = useSiteContent();
  const messages = getArray(content, "announcement.messages", fallback);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (messages.length === 0) return;
    const id = setInterval(() => setI((p) => (p + 1) % messages.length), 4000);
    return () => clearInterval(id);
  }, [messages.length]);
  return (
    <div className="bg-primary text-primary-foreground text-xs sm:text-sm">
      <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-2.5 text-center">
        <Award className="h-4 w-4 text-gold" />
        <span className="tracking-wider font-medium transition-opacity duration-500">
          {messages[i % messages.length]}
        </span>
      </div>
    </div>
  );
}
