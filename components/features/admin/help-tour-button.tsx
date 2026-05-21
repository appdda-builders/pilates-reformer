"use client"

import { usePathname } from "next/navigation"
import { CircleHelp } from "lucide-react"
import { driver } from "driver.js"
import { Button } from "@/components/shared/ui/button"
import {
  filterStepsWithExistingElements,
  getTourStepsForPathname,
} from "@/lib/dashboard-tours"

export function HelpTourButton() {
  const pathname = usePathname()

  function handleClick() {
    const rawSteps = getTourStepsForPathname(pathname)
    const steps = filterStepsWithExistingElements(rawSteps)
    if (steps.length === 0) {
      return
    }

    const driverObj = driver({
      showProgress: true,
      progressText: "{{current}} de {{total}}",
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Listo",
      steps,
    })

    driverObj.drive()
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Ayuda de esta sección"
      onClick={handleClick}
    >
      <CircleHelp className="h-5 w-5" />
    </Button>
  )
}
