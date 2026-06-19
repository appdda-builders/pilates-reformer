import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DashboardBrand } from "@/components/features/admin/dashboard-brand"
import { canAccessHiddenRegistry } from "@/lib/hidden-registry"
import { getStudioBranding } from "@/lib/studio-branding"
import { RegistryForm } from "./registry-form"

export const metadata: Metadata = {
  title: "Registro",
  robots: { index: false, follow: false },
}

type PageProps = {
  searchParams: Promise<{ t?: string }>
}

export default async function RegistryPage(props: PageProps) {
  const searchParams = await props.searchParams
  const token = typeof searchParams.t === "string" ? searchParams.t : undefined

  if (!canAccessHiddenRegistry(token)) {
    notFound()
  }

  const branding = await getStudioBranding()
  const registryToken = token ?? ""

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
      <DashboardBrand
        studioName={branding.studioName}
        logoUrl={branding.logoUrl}
        subtitle="Alta de usuario"
        className="mb-8 justify-center"
      />
      <RegistryForm registryToken={registryToken} />
    </div>
  )
}
