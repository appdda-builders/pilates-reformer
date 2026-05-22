import type { DriveStep } from "driver.js"
import { routes } from "@/lib/routes"

export type DashboardTourStep = DriveStep

function step(
  selector: string,
  title: string,
  description: string,
  side: "top" | "right" | "bottom" | "left" = "bottom",
): DashboardTourStep {
  return {
    element: selector,
    popover: { title, description, side, align: "start" },
  }
}

const dashboardSteps: DashboardTourStep[] = [
  step('[data-tour="page-header"]', "Dashboard", "Vista general del estudio."),
  step('[data-tour="dashboard-metrics"]', "Métricas", "Usuarios activos, clases, reservas e ingresos."),
  step('[data-tour="dashboard-chart"]', "Reservas por día", "Gráfica de reservas de la semana.", "top"),
]

const toursByPrefix: { prefix: string; steps: DashboardTourStep[] }[] = [
  { prefix: routes.dashboard, steps: dashboardSteps },
]

export function getTourStepsForPathname(pathname: string): DashboardTourStep[] {
  const normalized = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname
  for (const entry of toursByPrefix) {
    if (normalized === entry.prefix || normalized.startsWith(entry.prefix + "/")) {
      return entry.steps
    }
  }
  return dashboardSteps
}

export function filterStepsWithExistingElements(steps: DashboardTourStep[]): DashboardTourStep[] {
  const result: DashboardTourStep[] = []
  for (const s of steps) {
    if (s.element == null || typeof s.element !== "string") {
      result.push(s)
      continue
    }
    if (document.querySelector(s.element) != null) result.push(s)
  }
  return result
}
