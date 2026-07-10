import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { getTrustedOrigins } from "@/lib/auth-trusted-origins"
import { getAuthDb, getAuthProvider, getAuthSchema } from "@/lib/db"

const db = getAuthDb()

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: getTrustedOrigins(),
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "alumno" },
      phone: { type: "string", required: false },
      displayId: { type: "string", required: false },
      idPrefix: { type: "string", required: false, defaultValue: "ST" },
      birthdate: { type: "string", required: false },
      notes: { type: "string", required: false },
      enabled: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
    },
    changeEmail: { enabled: true },
    deleteUser: { enabled: true },
  },
  database: drizzleAdapter(db, {
    provider: getAuthProvider(),
    schema: getAuthSchema(),
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    sendResetPassword: async () => { void 0 },
  },
  plugins: [nextCookies()],
})
