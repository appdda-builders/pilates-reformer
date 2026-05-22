const fs = require("fs")
const path = require("path")

let parts = [process.platform, process.arch]

if (process.platform === "linux") {
  try {
    const { MUSL, familySync } = require("detect-libc")
    const family = familySync()
    if (family === MUSL) {
      parts.push("musl")
    } else if (process.arch === "arm") {
      parts.push("gnueabihf")
    } else {
      parts.push("gnu")
    }
  } catch {
    parts.push("gnu")
  }
} else if (process.platform === "win32") {
  parts.push("msvc")
}

const target = parts.join("-")
const nodeFile = `lightningcss.${target}.node`
const root = path.join(__dirname, "..")
const src = path.join(root, "node_modules", `lightningcss-${target}`, nodeFile)
const dest = path.join(root, "node_modules", "lightningcss", nodeFile)

if (!fs.existsSync(src)) {
  return
}

if (fs.existsSync(dest)) {
  return
}

const relative = path.relative(path.dirname(dest), src)
fs.symlinkSync(relative, dest)
