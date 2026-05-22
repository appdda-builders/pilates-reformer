export const LIST_PAGE_SIZE = 10

export function parseListPage(value: string | undefined): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
}

export function listPaginationOffset(page: number, pageSize = LIST_PAGE_SIZE): number {
  return (page - 1) * pageSize
}

export function totalListPages(totalItems: number, pageSize = LIST_PAGE_SIZE): number {
  if (totalItems <= 0) return 1
  return Math.ceil(totalItems / pageSize)
}

export function buildListQuery(
  basePath: string,
  page: number,
  extra?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams()
  if (extra) {
    for (const [key, val] of Object.entries(extra)) {
      if (val != null && val !== "") params.set(key, val)
    }
  }
  if (page > 1) params.set("page", String(page))
  const q = params.toString()
  return q ? `${basePath}?${q}` : basePath
}
