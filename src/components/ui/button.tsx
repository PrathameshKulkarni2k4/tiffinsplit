import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // `active:scale` is the whole trick: a control that shrinks very slightly
  // under the finger acknowledges the press. 0.97, not 0.9 - at button size a
  // larger scale reads as a wobble. Transform only, so nothing reflows.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-ease active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-card hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-card hover:bg-destructive/90",
        // `text-foreground` and a full-strength border, because at
        // `text-muted-foreground` on a tinted background this read as disabled
        // rather than as secondary.
        outline:
          "border border-input bg-card text-foreground shadow-card hover:border-primary/40 hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-card hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Mobile-first: every button clears the 44px touch-target guideline on
        // small screens, then relaxes to the tighter desktop sizing above 721px.
        default: "h-11 px-4 py-2 md:h-9",
        sm: "h-11 rounded-md px-3 text-xs md:h-8",
        lg: "h-11 rounded-md px-8",
        icon: "h-11 w-11 md:h-9 md:w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
