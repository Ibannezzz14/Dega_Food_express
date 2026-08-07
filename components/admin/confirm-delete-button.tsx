"use client";

type ConfirmDeleteButtonProps = {
  className?: string;
};

export default function ConfirmDeleteButton({
  className,
}: ConfirmDeleteButtonProps) {
  return (
    <button
      className={className}
      type="submit"
      onClick={(event) => {
        if (!window.confirm("Supprimer ce témoignage ?")) {
          event.preventDefault();
        }
      }}
    >
      Supprimer
    </button>
  );
}
