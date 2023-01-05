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

import { Router } from "https://deno.land/x/oak/mod.ts"
import { handleResponse } from "./helpers.ts"
import routeWebFinger from "./route.webfinger.ts"
import routeNodeInfo from "./route.nodeinfo.ts"
import routeBotsGet from "./route.bots.get.ts"
import routeMessages from "./route.message.ts"

const router = new Router()

router.get("/", ctx => {
  ctx.response.redirect("https://github.com/blue-forest/socialexplorer")
})

router.get("/robots.txt", ctx => {
  ctx.response.body = "User-agent: *\nDisallow: /"
})

router.get("/.well-known/webfinger", ctx => {
  const resource = ctx.request.url.searchParams.get("resource")
  return handleResponse(ctx, routeWebFinger(resource))
})

router.get("/.well-known/nodeinfo", ctx => {
  return handleResponse(ctx, routeNodeInfo())
})

router.get("/nodeinfo/2.0", ctx => {
  return handleResponse(ctx, routeNodeInfo())
})

router.get("/bots/:id", ctx => {
  const id = ctx.params.id
  return handleResponse(ctx, routeBotsGet(id))
})

router.get("/messages/:id", ctx => {
  const id = ctx.params.id
  return handleResponse(ctx, routeMessages(id))
})

export default router
