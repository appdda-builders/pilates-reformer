export function isAlumnoRole(role: string | undefined): boolean {
  return role === "alumno"
}

export function getSessionUserId(user: { id?: string | null } | undefined): string | null {
  if (user == null) return null
  const id = typeof user.id === "string" ? user.id.trim() : ""
  if (id.length === 0) return null
  return id
}
