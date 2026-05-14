import { cn } from "@/lib/utils";

const WA_NUMBER = "447503959285";
const WA_DEFAULT_MSG = "Hi Saleem Skin, I'd like to enquire about a treatment.";

export function whatsappHref(message = WA_DEFAULT_MSG) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M.057 24l1.687-6.163A11.867 11.867 0 0 1 .002 11.85C0 5.305 5.336 0 11.892 0a11.82 11.82 0 0 1 8.413 3.488 11.78 11.78 0 0 1 3.48 8.396c-.003 6.546-5.34 11.85-11.893 11.85a11.9 11.9 0 0 1-5.683-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l.36.572-1.001 3.654 3.745-.984.025.799zm6.597-5.443c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.298-.495.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01a1.094 1.094 0 0 0-.793.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
    </svg>
  );
}

type Props = {
  message?: string;
  className?: string;
  children?: React.ReactNode;
  iconClassName?: string;
  label?: string;
};

export function WhatsAppButton({ message, className, children, iconClassName, label = "WhatsApp" }: Props) {
  return (
    <a
      href={whatsappHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#1ebe57] transition-colors",
        className,
      )}
    >
      <WhatsAppIcon className={cn("h-4 w-4", iconClassName)} />
      {children}
    </a>
  );
}
