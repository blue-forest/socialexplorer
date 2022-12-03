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

import { Application } from "https://deno.land/x/oak/mod.ts"
import { RateLimiter } from "https://deno.land/x/oak_rate_limit/mod.ts"

const app = new Application()

const rateLimit = await RateLimiter({
  windowMs: 1000,
  max: 4,
  headers: true,
  message: "Too many requests, please try again later.",
  statusCode: 429,
  onRateLimit: ctx => console.log("Rate limit", ctx.request),

})
app.use(rateLimit)

app.use(ctx => {
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
  }
})

const envPort = Deno.env.get("PORT")
const port = envPort ? parseInt(envPort) : 3000
console.log(`Listening on http://localhost:${port}`)
await app.listen({ port })
