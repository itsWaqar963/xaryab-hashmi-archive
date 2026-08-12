import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
    
    const variantStyles = {
      default: "bg-accent text-white hover:bg-accent-light",
      secondary: "bg-sand/20 text-foreground hover:bg-sand/30",
      outline: "border border-sand text-foreground hover:bg-sand/10"
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className || ''}`}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }