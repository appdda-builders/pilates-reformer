export type CalendarFeedEvent = {
  id: string
  title: string
  start: string
  end?: string
  allDay?: boolean
  display?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  classNames?: string[]
  extendedProps?: {
    source?: string
    description?: string | null
    eventType?: string
    visibleTo?: string
    raw?: unknown
  }
}
