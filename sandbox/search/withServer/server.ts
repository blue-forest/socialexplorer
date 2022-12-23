/*
 * SocialExplorer
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
import { Application, Router } from "https://deno.land/x/oak/mod.ts"
import { RateLimiter } from "https://deno.land/x/oak_rate_limit/mod.ts"

const db = new DB("data.sqlite")
db.query(
  `CREATE TABLE IF NOT EXISTS instances (`
  + `id INTEGER PRIMARY KEY AUTOINCREMENT,`
  + `domain TEXT UNIQUE,`
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
  max: 10,
  headers: true,
  message: "Too many requests, please try again later.",
  statusCode: 429,
  onRateLimit: ctx => console.log("[RATE LIMIT]", ctx.request),
}))

const router = new Router()

router.get("/", ctx => {
  ctx.response.headers.set("Content-Type", "text/html")
  ctx.response.body = Deno.readTextFileSync("index.html").replace(
    /\[\/\*\*\/\]/g,
    JSON.stringify(db.query("SELECT id, domain, users FROM instances")
      .map(([id, domain, users]) => ({
        id,
        domain,
        ...(users !== null && { users }),
      }))
    )
  )
})

router.get("/api", ctx => {
  if (!ctx.isUpgradable) {
    ctx.throw(400, "WebSockets are required.")
  } else {
    try {
      const ws = ctx.upgrade()
      ws.onmessage = ({ data }) => {
        const json: { search?: string } = JSON.parse(data)
        if (typeof json.search === "string") {
          for (const [domain] of db.query("SELECT domain FROM instances")) {
            if (ws.readyState !== 1) break
            fetch(`https://${domain}/api/v2/search?q=${encodeURIComponent(json.search)}&limit=5`)
              .then(async res => {
                if (res.ok) {
                  const json: { accounts: any[], hashtags: any[] } = await res.json()
                  if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                      accounts: json.accounts.map(item => ({
                        id: item.acct,
                        name: item.display_name || item.username,
                        avatar: item.avatar,
                        url: item.url,
                      })),
                      hashtags: json.hashtags.map(({ name, url }) => ({ name, url })),
                    }))
                  }
                }
              })
              .catch(e => console.log("Failed to fetch", domain, ":", e))
          }
        }
      }
    } catch (e) {
      console.error("[API ERROR]", e)
    }
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

const envPort = Deno.env.get("PORT")
const port = envPort ? parseInt(envPort) : 3000
console.log(`Listening on http://localhost:${port}`)
await app.listen({ port })
