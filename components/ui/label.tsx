import { cn } from "@/lib/utils";
import { forwardRef, LabelHTMLAttributes } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };
