"use client"

import Image from "next/image"
import { siteLogo } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

const LOGO_MARK_BG = "#0D4714"

export function DashboardBrand(props: {
  studioName: string
  logoUrl?: string | null
  subtitle?: string
  className?: string
}) {
  const logoSrc =
    props.logoUrl != null && props.logoUrl.trim() !== ""
      ? props.logoUrl.trim()
      : siteLogo
  const subtitle = props.subtitle ?? "Sistema de Reservas"

  return (
    <div className={cn("flex items-center gap-3", props.className)}>
      <div
        className="relative h-12 w-12 shrink-0 rounded-full p-5 bg-white overflow-hidden"
      >
        <Image
          src={logoSrc}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
          unoptimized={logoSrc.startsWith("http")}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight">{props.studioName}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}
