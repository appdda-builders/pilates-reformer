import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/shared/ui/pagination"
import { LIST_PAGE_SIZE, buildListQuery, totalListPages } from "@/lib/list-pagination"

type ListPaginationProps = {
  basePath: string
  page: number
  totalItems: number
  pageSize?: number
  query?: Record<string, string | undefined>
}

export function ListPagination(props: ListPaginationProps) {
  const pageSize = props.pageSize ?? LIST_PAGE_SIZE
  const totalPages = totalListPages(props.totalItems, pageSize)
  const page = Math.min(Math.max(1, props.page), totalPages)

  if (props.totalItems <= pageSize) {
    return (
      <p className="text-sm text-muted-foreground text-center py-3">
        {props.totalItems === 0 ? "Sin resultados" : `${props.totalItems} registro(s)`}
      </p>
    )
  }

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, props.totalItems)
  const prevHref = page > 1 ? buildListQuery(props.basePath, page - 1, props.query) : null
  const nextHref = page < totalPages ? buildListQuery(props.basePath, page + 1, props.query) : null

  const pageNumbers: number[] = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      pageNumbers.push(p)
    }
  }

  const links: Array<number | "gap"> = []
  let last = 0
  for (const p of pageNumbers) {
    if (last > 0 && p - last > 1) links.push("gap")
    links.push(p)
    last = p
  }

  return (
    <div className="flex flex-col items-center gap-2 py-4 border-t">
      <p className="text-sm text-muted-foreground">
        Mostrando {from}–{to} de {props.totalItems}
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            {prevHref ? (
              <PaginationPrevious href={prevHref} />
            ) : (
              <span className="pointer-events-none opacity-40">
                <PaginationPrevious href="#" />
              </span>
            )}
          </PaginationItem>
          {links.map((item, i) =>
            item === "gap" ? (
              <PaginationItem key={`gap-${i}`}>
                <span className="px-2 text-muted-foreground">…</span>
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href={buildListQuery(props.basePath, item, props.query)}
                  isActive={item === page}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            {nextHref ? (
              <PaginationNext href={nextHref} />
            ) : (
              <span className="pointer-events-none opacity-40">
                <PaginationNext href="#" />
              </span>
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
