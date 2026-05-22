export const dynamic = "force-dynamic"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/shared/ui/sidebar"
import { AppSidebar } from "@/components/features/admin/app-sidebar"
import { Navbar } from "@/components/features/admin/navbar"
import { DashboardProviders } from "@/components/features/admin/dashboard-providers"
import { auth } from "@/lib/auth"
import { loadNavPermissions } from "@/lib/nav-permissions.server"
import {
  canAccessDashboardPath,
  getFirstAllowedDashboardUrl,
  hasNoNavAccess,
} from "@/lib/nav-permissions"
import { routes } from "@/lib/routes"
import { NoAccessPanel } from "@/components/features/admin/no-access-panel"
import { getStudioBranding } from "@/lib/studio-branding"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
    query: { disableRefresh: true },
  })
  if (session == null) {
    redirect("/login")
  }

  const u = session.user as {
    name?: string
    email?: string
    role?: string
    enabled?: boolean
  }

  if (u.enabled === false) {
    redirect("/login?inhabilitado=1")
  }

  const navName =
    u.name != null && u.name !== "" ? u.name : "Usuario"
  const navEmail = u.email ?? ""
  const role = typeof u.role === "string" ? u.role : "alumno"

  const [navPermissions, studioBranding] = await Promise.all([
    loadNavPermissions(),
    getStudioBranding(),
  ])
  const noNavAccess = hasNoNavAccess(role, navPermissions)

  const pathname = headersList.get("x-dashboard-pathname") ?? routes.dashboard
  if (
    !noNavAccess &&
    !canAccessDashboardPath(role, pathname, navPermissions)
  ) {
    redirect(getFirstAllowedDashboardUrl(role, navPermissions))
  }

  return (
    <SidebarProvider>
      <AppSidebar
        role={role}
        navPermissions={navPermissions}
        studioName={studioBranding.studioName}
        logoUrl={studioBranding.logoUrl}
      />
      <DashboardProviders>
        <SidebarInset className="min-w-0">
          <Navbar userName={navName} userEmail={navEmail} />
          <main className="flex-1 overflow-auto min-w-0">
            {noNavAccess ? <NoAccessPanel /> : children}
          </main>
        </SidebarInset>
      </DashboardProviders>
    </SidebarProvider>
  )
}
