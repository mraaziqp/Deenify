
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  // Filter out all unknown data-* attributes to prevent hydration errors
  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(
      ([key]) => !/^data-/.test(key)
    )
  );
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...filteredProps}
    />
  );
});
Input.displayName = "Input"

export { Input }
