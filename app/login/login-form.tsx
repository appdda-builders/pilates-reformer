"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/shared/ui/button"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/shared/ui/card"
import { LoginLoadingOverlay } from "@/components/features/login/login-loading-overlay"
import { DashboardBrand } from "@/components/features/admin/dashboard-brand"
import { authClient } from "@/lib/auth-client"
import { routes } from "@/lib/routes"

const CONNECTION_ERROR_MSG = "Problemas de conexión. Vuelva a intentar más tarde."

async function waitForSessionUser() {
  for (let i = 0; i < 40; i++) {
    const s = await authClient.getSession()
    if (s.data?.user != null) return s.data.user
    await new Promise<void>((resolve) => { window.setTimeout(resolve, 150) })
  }
  return null
}

export function LoginForm(props: { studioName: string; logoUrl: string | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [overlayActive, setOverlayActive] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const redirectingRef = useRef(false)

  const { data: session } = authClient.useSession()
  const sessionUserId = session?.user?.id

  const handleConnectionTimeout = useCallback(async function handleConnectionTimeout() {
    const s = await authClient.getSession()
    const user = s.data?.user
    if (user != null) {
      const enabled = (user as { enabled?: boolean }).enabled
      if (enabled !== false) {
        window.location.assign(routes.dashboard)
        return
      }
    }
    redirectingRef.current = false
    setOverlayActive(false)
    setErrorMsg(CONNECTION_ERROR_MSG)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("inhabilitado") === "1") {
      setErrorMsg("Tu cuenta está inhabilitada. Contacta al estudio.")
    }
  }, [])

  useEffect(() => {
    if (pathname !== routes.login) return
    if (redirectingRef.current) return
    if (sessionUserId == null) return
    const enabled = (session?.user as { enabled?: boolean } | undefined)?.enabled
    if (enabled === false) {
      void authClient.signOut()
      setErrorMsg("Tu cuenta está inhabilitada. Contacta al estudio.")
      return
    }
    router.replace(routes.dashboard)
  }, [pathname, sessionUserId, session?.user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    redirectingRef.current = true
    setOverlayActive(true)

    const res = await authClient.signIn.email({ email, password })
    if (res.error != null) {
      redirectingRef.current = false
      setOverlayActive(false)
      const msg = res.error.message ?? ""
      if (msg.toLowerCase().includes("inhabilitad")) {
        setErrorMsg("Tu cuenta está inhabilitada. Contacta al estudio.")
      } else {
        setErrorMsg("Correo o contraseña incorrectos")
      }
      return
    }

    const user = await waitForSessionUser()
    if (user == null) {
      redirectingRef.current = false
      setOverlayActive(false)
      setErrorMsg(CONNECTION_ERROR_MSG)
      return
    }

    const enabled = (user as { enabled?: boolean }).enabled
    if (enabled === false) {
      await authClient.signOut()
      redirectingRef.current = false
      setOverlayActive(false)
      setErrorMsg("Tu cuenta está inhabilitada. Contacta al estudio.")
      return
    }

    window.location.assign(routes.dashboard)
  }

  return (
    <>
      <LoginLoadingOverlay active={overlayActive} onConnectionTimeout={handleConnectionTimeout} />
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <DashboardBrand
          studioName={props.studioName}
          logoUrl={props.logoUrl}
          subtitle="Panel de administración"
          className="mb-8 justify-center"
        />
        <Card className="w-full max-w-md border shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder al panel</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <CardContent className="space-y-4">
              {errorMsg ? <p className="text-sm text-destructive">{errorMsg}</p> : null}
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email" type="email" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required disabled={overlayActive}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password" type="password" autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required disabled={overlayActive}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button className="w-full" type="submit" disabled={overlayActive}>
                {overlayActive ? "Ingresando..." : "Continuar"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                <Link href="/" className="text-primary hover:underline">Regresar al sitio</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  )
}
