import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5 12 4 4L19 6" />
    </IconBase>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconBase>
  );
}

export function PickupIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 10v10h16V10" />
      <path d="M3 10h18L19 4H5l-2 6Z" />
      <path d="M8 20v-5h8v5" />
      <path d="M7 10a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
    </IconBase>
  );
}

export function DeliveryIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6h11v11H3V6Z" />
      <path d="M14 10h4l3 3v4h-7v-7Z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </IconBase>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.9L3 21l1.8-4.8A8.5 8.5 0 1 1 21 11.5Z" />
    </IconBase>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
    </IconBase>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </IconBase>
  );
}

export function PeopleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15.5 14.5A4.5 4.5 0 0 1 21 19" />
    </IconBase>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </IconBase>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20.5 3.5C12 3.7 6.5 6.8 5.2 12.2c-.8 3.2 1 6.7 4.3 7.6 5.4 1.5 9.2-4 11-16.3Z" />
      <path d="M4 21c2.2-5.3 6.3-9.1 12.5-11.5" />
    </IconBase>
  );
}

export function CakeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 10h16v10H4V10Z" />
      <path d="M4 14c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />
      <path d="M12 4v3" />
      <path d="M10.5 4c0-1 1.5-2 1.5-2s1.5 1 1.5 2A1.5 1.5 0 0 1 12 5.5 1.5 1.5 0 0 1 10.5 4Z" />
    </IconBase>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </IconBase>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18M10 12v2h4v-2" />
    </IconBase>
  );
}

export function ServingTrayIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 16h16" />
      <path d="M6 16a6 6 0 0 1 12 0" />
      <path d="M3 20h18" />
      <path d="M12 7V4" />
      <path d="M10 4h4" />
    </IconBase>
  );
}

export function UtensilsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 3v7M4 3v4a3 3 0 0 0 6 0V3M7 10v11" />
      <path d="M17 3c-2 2-3 5-3 8h4V3h-1ZM18 11v10" />
    </IconBase>
  );
}
