export const USER_ID_PREFIX_REGULAR = "ST"

export type UserIdPrefix = typeof USER_ID_PREFIX_REGULAR

export function parseUserIdPrefix(_raw: unknown): UserIdPrefix {
  return USER_ID_PREFIX_REGULAR
}
