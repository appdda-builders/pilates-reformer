import { createAuthClient } from "better-auth/react"

let base = ""
if (typeof window !== "undefined") {
  base = window.location.origin
} else {
  const u = process.env.NEXT_PUBLIC_BETTER_AUTH_URL
  if (u != null && u !== "") {
    base = u
  }
}

export const authClient = createAuthClient({
  ...(base !== "" ? { baseURL: base } : {}),
  sessionOptions: {
    refetchOnWindowFocus: false,
  },
})
