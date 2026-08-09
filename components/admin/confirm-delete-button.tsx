"use client";

import { useFormStatus } from "react-dom";

type ConfirmDeleteButtonProps = {
  className?: string;
  displayName: string;
};

export default function ConfirmDeleteButton({
  className,
  displayName,
}: ConfirmDeleteButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={className}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      aria-label={`Supprimer le témoignage de ${displayName}`}
      onClick={(event) => {
        if (!window.confirm("Supprimer ce témoignage ?")) {
          event.preventDefault();
        }
      }}
    >
      {pending ? "Suppression…" : "Supprimer"}
    </button>
  );
}
