import { loadReservacionesPlans } from "@/lib/site/public-plans.server"
import { HomePage } from "./home-page"

export default async function Page() {
  const plans = await loadReservacionesPlans()
  return <HomePage plans={plans} />
}
