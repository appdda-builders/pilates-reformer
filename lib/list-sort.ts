export type ListSortDir = "asc" | "desc"

export function parseListSort<T extends string>(
  value: string | undefined,
  allowed: T[],
  defaultCol: T,
): { col: T; dir: ListSortDir } {
  if (!value) return { col: defaultCol, dir: "asc" }
  const [col, dir] = value.split(":")
  const validCol = (allowed as string[]).includes(col) ? (col as T) : defaultCol
  const validDir: ListSortDir = dir === "desc" ? "desc" : "asc"
  return { col: validCol, dir: validDir }
}

export function buildSortHref(
  basePath: string,
  col: string,
  currentCol: string,
  currentDir: ListSortDir,
  extra?: Record<string, string | undefined>,
): string {
  const nextDir: ListSortDir =
    currentCol === col && currentDir === "asc" ? "desc" : "asc"
  const params = new URLSearchParams()
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) params.set(k, v)
    }
  }
  params.set("sort", `${col}:${nextDir}`)
  return `${basePath}?${params.toString()}`
}
