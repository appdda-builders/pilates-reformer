import { buildListQuery } from "@/lib/list-pagination"

export type ListSortDir = "asc" | "desc"

export function parseListSortDir(
  value: string | undefined,
  defaultDir: ListSortDir = "asc",
): ListSortDir {
  if (value === "desc") return "desc"
  if (value === "asc") return "asc"
  return defaultDir
}

export function parseListSort(
  value: string | undefined,
  allowed: readonly string[],
  defaultSort: string,
): string {
  if (value != null && allowed.includes(value)) return value
  return defaultSort
}

export function nextListSortDir(
  currentSort: string,
  clickedSort: string,
  currentDir: ListSortDir,
): ListSortDir {
  if (currentSort === clickedSort) {
    return currentDir === "asc" ? "desc" : "asc"
  }
  return "asc"
}

export function sortSearchParams(
  sort: string,
  dir: ListSortDir,
  defaults: { sort: string; dir?: ListSortDir },
): Record<string, string | undefined> {
  const defaultDir = defaults.dir ?? "asc"
  const out: Record<string, string | undefined> = {}
  if (sort !== defaults.sort) out.sort = sort
  if (dir !== defaultDir) out.dir = dir
  return out
}

export function buildSortHref(
  basePath: string,
  currentSort: string,
  clickedSort: string,
  currentDir: ListSortDir,
  extra?: Record<string, string | undefined>,
  defaults?: { sort: string; dir?: ListSortDir },
): string {
  const dir = nextListSortDir(currentSort, clickedSort, currentDir)
  const defaultSort = defaults?.sort ?? clickedSort
  const defaultDir = defaults?.dir ?? "asc"

  const query: Record<string, string | undefined> = {}
  if (extra) {
    for (const [key, val] of Object.entries(extra)) {
      if (key === "sort" || key === "dir") continue
      if (val != null && val !== "") query[key] = val
    }
  }
  if (clickedSort !== defaultSort) query.sort = clickedSort
  if (dir !== defaultDir) query.dir = dir
  return buildListQuery(basePath, 1, query)
}
