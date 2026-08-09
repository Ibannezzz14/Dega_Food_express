"use client";

import { useEffect, useRef } from "react";

type AdminFeedbackProps = {
  kind: "success" | "error";
  message: string;
  className?: string;
};

export default function AdminFeedback({
  kind,
  message,
  className,
}: AdminFeedbackProps) {
  const feedbackRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    feedbackRef.current?.focus();
  }, [message]);

  return (
    <p
      className={className}
      ref={feedbackRef}
      role={kind === "error" ? "alert" : "status"}
      tabIndex={-1}
    >
      {message}
    </p>
  );
}
