"use client"

import { DbActionFeedbackProvider } from "@/components/features/admin/db-action-feedback"

export function DashboardProviders(props: { children: React.ReactNode }) {
  return <DbActionFeedbackProvider>{props.children}</DbActionFeedbackProvider>
}
