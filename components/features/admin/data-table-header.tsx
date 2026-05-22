"use client"

import { Search, Info, Filter } from "lucide-react"
import { Input } from "@/components/shared/ui/input"
import { Button } from "@/components/shared/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shared/ui/tooltip"

type DataTableHeaderProps = {
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  searchValue?: string
  infoTooltip?: string
  onFilterClick?: () => void
  showFilters?: boolean
}

export function DataTableHeader({
  searchPlaceholder = "Search...",
  onSearchChange,
  searchValue = "",
  infoTooltip = "Search across all table fields",
  onFilterClick,
  showFilters = true,
}: DataTableHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9 h-9 border-border"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{infoTooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {showFilters && (
        <Button variant="outline" size="sm" className="h-9" onClick={onFilterClick}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      )}
    </div>
  )
}
