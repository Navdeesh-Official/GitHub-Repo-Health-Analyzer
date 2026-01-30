import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl glass p-6 transition-all duration-300 hover:border-slate-700",
                className
            )}
            {...props}
        />
    )
);
Card.displayName = "Card";

export const CardTitle = ({ className, children }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-lg font-semibold text-white", className)}>{children}</h3>
);
