"use client";

import { useFormStatus } from "react-dom";

type AdminSubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

export default function AdminSubmitButton({
  children,
  pendingLabel,
  className,
  disabled = false,
  ariaLabel,
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={className}
      type="submit"
      disabled={disabled || pending}
      aria-label={ariaLabel}
      aria-disabled={disabled || pending}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
