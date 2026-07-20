import Link from "next/link"
import { AgendarScreen } from "@/components/agendar-screen"
import { routes } from "@/lib/routes"

type SearchParams = Promise<{ date?: string; slot?: string }>

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  return (
    <main className="min-h-screen bg-[#f9f0e3] text-[#1b1a18]">
      <div className="border-b border-black/10 bg-white/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold text-green-base hover:underline">
            ← Studio 57
          </Link>
          <Link href={routes.login} className="text-sm font-semibold text-black/70 hover:text-black">
            Iniciar sesión
          </Link>
        </div>
      </div>
      <AgendarScreen
        initialDate={params.date ?? null}
        initialSlotId={params.slot ?? null}
      />
    </main>
  )
}
