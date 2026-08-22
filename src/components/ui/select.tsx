import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <span className="relative block">
    <select
      ref={ref}
      className={cn(
        "min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-border bg-surface px-4 py-2.5 pr-11 text-base text-foreground transition-colors duration-200 focus:border-accent focus:outline-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      aria-hidden
      className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted"
    />
  </span>
));
Select.displayName = "Select";
