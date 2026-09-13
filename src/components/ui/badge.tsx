import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-elevated text-muted shadow-[var(--shadow-border)]",
        pass: "bg-pass/15 text-pass",
        fail: "bg-fail/15 text-fail",
        accent: "bg-accent/15 text-accent",
        warn: "bg-warn/15 text-warn",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
