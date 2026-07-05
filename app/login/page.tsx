import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getStudioBranding } from "@/lib/studio-branding"
import { auth } from "@/lib/auth"
import { routes } from "@/lib/routes"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableRefresh: true },
  })
  const user = session?.user as { enabled?: boolean } | undefined
  if (user != null && user.enabled !== false) {
    redirect(routes.dashboard)
  }

  const branding = await getStudioBranding()
  return (
    <LoginForm
      studioName={branding.studioName}
      logoUrl={branding.logoUrl}
    />
  )
}
