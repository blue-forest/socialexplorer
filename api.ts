/*
 * SocialExplorer
 * Copyright © 2019-2023 Blue Forest
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

import { serve } from "https://deno.land/std/http/server.ts"
import { request } from "./utils.ts";

const TOKEN = Deno.env.get("SOCIAL_EXPLORER_TOKEN") || "local"
const GORSE = Deno.env.get("SOCIAL_EXPLORER_GORSE") || "http://127.0.0.1:8088"

serve(async req => {
  try {
    if(req.method === "POST") {
      if(req.headers.get("Authorization") === `Bearer ${TOKEN}`) {
        const body = await req.arrayBuffer()
        const data = JSON.parse(new TextDecoder().decode(body))
        const path = new URL(req.url).pathname
        if(path === "/providers/rss") {
          console.log("[ADD]", data.url)
          const response = await request(
            "POST",
            `${GORSE}/api/item`,
            {
              "ItemId": data.id,
              "Comment": data.url,
              "Categories": data.categories,
              "Labels": data.labels,
              "Timestamp": data.date,
              "IsHidden": false,
            },
          )
          if(response) {
            return new Response(null, { status: 200 })
          }
        }
      }
    }
  } catch(e) {
    console.error("[ERROR]", e)
  }
  return new Response(null, { status: 404 })
}, {
  port: 8080,
  onListen: () => console.log("API server started on port 8080"),
})
