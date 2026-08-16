import { cn } from "@/lib/utils";

const WA_NUMBER = "447503959285";
const WA_DEFAULT_MSG = "Hi Saleem Skin, I'd like to enquire about a treatment.";

export function whatsappHref(message = WA_DEFAULT_MSG) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16 3C8.82 3 3 8.82 3 16c0 2.29.6 4.52 1.74 6.49L3 29l6.68-1.7A12.94 12.94 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.6c-1.99 0-3.94-.53-5.65-1.55l-.4-.24-3.96 1.01 1.05-3.86-.26-.41A10.55 10.55 0 0 1 5.4 16C5.4 10.15 10.15 5.4 16 5.4S26.6 10.15 26.6 16 21.85 26.6 16 26.6zm5.83-7.93c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.81 1.03-.99 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55-.18-.01-.4-.01-.61-.01s-.55.08-.84.4c-.29.32-1.1 1.07-1.1 2.61s1.13 3.03 1.29 3.24c.16.21 2.22 3.39 5.38 4.76.75.32 1.34.51 1.79.66.75.24 1.43.21 1.97.13.6-.09 1.88-.77 2.14-1.51.26-.74.26-1.37.18-1.51-.08-.13-.29-.21-.61-.37z" />
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
        "inline-flex items-center justify-center gap-2 bg-deep-green text-primary-foreground hover:bg-deep-green/90 transition-colors",
        className,
      )}
    >
      <WhatsAppIcon className={cn("h-4 w-4", iconClassName)} />
      {children}
    </a>
  );
}
