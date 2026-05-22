"use client"

import nextDynamic from "next/dynamic"
import type { CalendarFeedEvent } from "./calendar-types"

const CalendarClient = nextDynamic(
  () => import("./CalendarClient").then((m) => m.CalendarClient),
  { ssr: false },
)

export function CalendarShell(props: {
  events: CalendarFeedEvent[]
  canManage: boolean
}) {
  return <CalendarClient events={props.events} canManage={props.canManage} />
}
