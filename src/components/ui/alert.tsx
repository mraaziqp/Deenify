>(({ className, variant, ...props }, ref) => (
>(({ className, ...props }, ref) => (
>(({ className, ...props }, ref) => (

import * as React from "react"
import { cn } from "@/lib/utils"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

const Alert = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		role="alert"
		className={cn(
			"relative w-full rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive dark:border-destructive/80 dark:bg-destructive/20",
			className
		)}
		{...props}
	/>
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h5
		ref={ref}
		className={cn("mb-1 font-medium leading-none tracking-tight", className)}
		{...props}
	/>
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("text-sm [&_p]:leading-relaxed", className)}
		{...props}
	/>
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
