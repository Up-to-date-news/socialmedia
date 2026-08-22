import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl bg-bg-elevated border border-border shadow-card ${className}`}
      {...props}
    />
  );
}
