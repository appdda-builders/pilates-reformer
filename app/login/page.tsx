import { getStudioBranding } from "@/lib/studio-branding"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  const branding = await getStudioBranding()
  return (
    <LoginForm
      studioName={branding.studioName}
      logoUrl={branding.logoUrl}
    />
  )
}
