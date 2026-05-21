import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string | React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div data-tour="page-header">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children ? (
        <div data-tour="page-actions" className="flex items-center gap-2">
          {children}
        </div>
      ) : null}
    </div>
  )
}
