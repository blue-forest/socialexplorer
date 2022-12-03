/*
 * SocialExplorer.ml
 * Copyright © 2019-2022 Blue Forest
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { DB } from "https://deno.land/x/sqlite/mod.ts"
import { Application } from "https://deno.land/x/oak/mod.ts"
import { RateLimiter } from "https://deno.land/x/oak_rate_limit/mod.ts"
import { sha256 } from "https://denopkg.com/chiefbiiko/sha256/mod.ts"

const db = new DB("data.sqlite")
db.query(
  `CREATE TABLE IF NOT EXISTS instances (`
  + `domain TEXT PRIMARY KEY,`
  + `hash TEXT NOT NULL,`
  + `date INTEGER NOT NULL,`
  + `softwareName TEXT,`
  + `softwareVersion TEXT,`
  + `registrations BOOLEAN,`
  + `users INTEGER,`
  + `statuses INTEGER`
  + `)`
)

const app = new Application()

app.use(await RateLimiter({
  windowMs: 1000,
  max: 4,
  headers: true,
  message: "Too many requests, please try again later.",
  statusCode: 429,
  onRateLimit: ctx => console.log("[RATE LIMIT]", ctx.request),
}))

const suggestURL = "/api/suggest/"

app.use(ctx => {
  if (ctx.request.method === "GET") {
    if (ctx.request.url.pathname === "/") {
      ctx.response.headers.set("Content-Type", "text/html")
      ctx.response.body = `<!DOCTYPE html><html>`
        + `<head>`
        + `<title>SocialExplorer</title>`
        + `</head>`
        + `<body>`
        + `<script type="module">`
        + `import { add } from "./script.js";`
        + `document.body.innerText = add(320, 100)`
        + `</script>`
        + `</body>`
        + `</html>`
    } else if (ctx.request.url.pathname === "/script.js") {
      ctx.response.headers.set("Content-Type", "text/javascript")
      ctx.response.body = Deno.readTextFileSync("./build/script.js")
    } else if (ctx.request.url.pathname === "/script.wasm") {
      ctx.response.headers.set("Content-Type", "application/wasm")
      ctx.response.body = Deno.readFileSync("./build/script.wasm")
    } else if (ctx.request.url.pathname === "/api/instances") {
      ctx.response.headers.set("Content-Type", "application/json")
      const instances = db.query("SELECT domain, users FROM instances")
      ctx.response.body = JSON.stringify(instances.map(([domain, users]) => ({
        domain,
        ...(users !== null && { users }),
      })))
    }
  } else if (ctx.request.method === "POST") {
    if (
      ctx.request.url.pathname.length > suggestURL.length
      && ctx.request.url.pathname.startsWith(suggestURL)
    ) {
      (async () => {
        try {
          const manifestDomain = ctx.request.url.pathname.slice(suggestURL.length)
          const nodeManifestData = await fetch(`https://${manifestDomain}/.well-known/nodeinfo`)
          const nodeManifestInfo = await nodeManifestData.json()
          const nodePath = nodeManifestInfo.links[0].href
          const domain = new URL(nodePath).hostname
          const nodeData = await fetch(nodePath)
          const nodeText = await nodeData.text()
          const hash = sha256(nodeText, "utf8", "hex")
          const instance = db.query<any>(
            "SELECT hash FROM instances WHERE domain = ?",
            [domain]
          )
          if (
            instance.length === 0
            || instance[0][0] !== hash
          ) {
            console.log(
              `[INSTANCE ${instance.length === 0 ? "ADD" : "UPDATE"}] ${domain}`
            )
            const nodeInfo = JSON.parse(nodeText)
            db.query(
              `INSERT OR REPLACE INTO instances VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                domain,
                hash,
                Date.now(),
                nodeInfo?.software?.name ?? null,
                nodeInfo?.software?.version ?? null,
                nodeInfo?.openRegistrations ?? null,
                nodeInfo?.usage?.users?.total ?? null,
                nodeInfo?.usage?.localPosts ?? null,
              ]
            )
          }
        } catch (e) {
          console.error("[SUGGEST]", e)
        }
      })()
      ctx.response.body = ""
    }
  }
})

const envPort = Deno.env.get("PORT")
const port = envPort ? parseInt(envPort) : 3000
console.log(`Listening on http://localhost:${port}`)
await app.listen({ port })
