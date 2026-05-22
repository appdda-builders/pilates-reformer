function replaceToken(template: string, key: string, value: string): string {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, "gi")
  return template.replace(pattern, value)
}

export function interpolateMessage(
  template: string,
  ctx: {
    nombre?: string
    plan?: string
    estudio?: string
    fecha?: string
    displayId?: string
  },
): string {
  let out = template
  out = replaceToken(out, "nombre", ctx.nombre ?? "")
  out = replaceToken(out, "plan", ctx.plan ?? "")
  out = replaceToken(out, "estudio", ctx.estudio ?? "")
  out = replaceToken(out, "fecha", ctx.fecha ?? "")
  out = replaceToken(out, "displayId", ctx.displayId ?? "")
  return out
}
