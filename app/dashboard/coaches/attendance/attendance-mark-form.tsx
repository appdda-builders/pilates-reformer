"use client"

import { DbActionForm } from "@/components/features/admin/db-action-form"
import { toggleAttendanceAction } from "./actions"

export function AttendanceMarkForm(props: {
  bookingId: string
  attended: "true" | "false"
  dateStr?: string
  children: React.ReactNode
}) {
  return (
    <DbActionForm action={toggleAttendanceAction} kind="update" className="inline-flex flex-row">
      <input type="hidden" name="bookingId" value={props.bookingId} />
      <input type="hidden" name="attended" value={props.attended} />
      {props.dateStr ? <input type="hidden" name="date" value={props.dateStr} /> : null}
      {props.children}
    </DbActionForm>
  )
}
