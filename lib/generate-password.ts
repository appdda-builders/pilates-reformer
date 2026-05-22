import { randomInt } from "crypto"

export function generatePassword(length: number = 6): string {
  let password = ""
  for (let i = 0; i < length; i++) {
    password += String(randomInt(0, 10))
  }
  return password
}
