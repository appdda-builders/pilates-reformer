import Link from "next/link"
import { TableHead } from "@/components/shared/ui/table"
import { cn } from "@/lib/utils"
import type { ListSortDir } from "@/lib/list-sort"

type SortableTableHeadProps = {
  href: string
  active: boolean
  dir: ListSortDir
  className?: string
  children: React.ReactNode
}

export function SortableTableHead(props: SortableTableHeadProps) {
  return (
    <TableHead className={props.className}>
      <Link
        href={props.href}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          props.active && "text-foreground",
        )}
      >
        {props.children}
        {props.active ? (
          <span className="text-foreground" aria-hidden>
            {props.dir === "asc" ? "↑" : "↓"}
          </span>
        ) : (
          <span className="text-muted-foreground/40" aria-hidden>
            ↕
          </span>
        )}
      </Link>
    </TableHead>
  )
}
