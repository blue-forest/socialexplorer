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

import { Application, Router } from "https://deno.land/x/oak/mod.ts"
import { RateLimiter } from "https://deno.land/x/oak_rate_limit/mod.ts"

const app = new Application()

const publicKeyPem = Deno.readTextFileSync("./key.pub")

type Data = {
  instance: string
  users: {
    [id: string]: {
      name: string
      followers: string[]
      outbox: { id: string, content: string }[]
      inbox: { id: string,  content: string }[]
    }
  }
}
const data: Data = JSON.parse(Deno.readTextFileSync("./data.json"))
function saveData() {
  Deno.writeTextFileSync("./data.json", JSON.stringify(data, null, 2))
}


const router = new Router()


router.get("/.well-known/webfinger", ctx => {
  const resource = ctx.request.url.searchParams.get("resource")
  if (!resource) return
  const acct = resource.split(":")[1]
  if (!acct) return
  const split = acct.split("@")
  console.log("====", data.users, split[0])
  if (
    split.length !== 2
      || split[1] !== data.instance
      || !data.users[split[0]]
  ) return
  ctx.response.body = {
    subject: resource,
    links: [
      {
        rel: "self",
        type: "application/activity+json",
        href: `https://${data.instance}/users/${split[0]}`,
      },
    ],
  }
})


router.get("/.well-known/nodeinfo", ctx => {
  ctx.response.body = {
    links: [
      {
        rel: "http://nodeinfo.diaspora.software/ns/schema/2.0",
        href: `https://${data.instance}/nodeinfo/2.0`,
      },
    ],
  }
})


router.get("/nodeinfo/2.0", ctx => {
  ctx.response.body = {
    version: "2.0",
    software: {
      name: "tests",
      version: "0.0.1",
      //name: "socialexplorer",
      //version: "0.6.2-0",
    },
    protocols: ["activitypub"],
    services: { inbound: [], outbound: [], },
    openRegistrations: false,
    usage: {
      users: { total: 1 },
      localPosts: 0,
      localComments: 0,
    },
    /*metadata: {
      sourceCode: "https://github.com/blue-forest/socialexplorer",
    },*/
  }
})


router.get("/users/:id", ctx => {
  const id = ctx.params.id
  if (!id) return
  const user = data.users[id]
  if (!user) return
  const userUrl = `https://${data.instance}/users/${id}`
  ctx.response.body = {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Service",
    id: userUrl,
    url: userUrl,
    preferredUsername: id,
    name: `Test bot #${id}`,
    //summary: user.summary,
    icon: {
      type: "Image",
      mediaType: "image/png",
      url: `https://howtodrawforkids.com/wp-content/uploads/2022/01/how-to-draw-a-robot-for-kids.jpg`,
    },
    manuallyApprovesFollowers: false,
    discoverable: true,
    inbox: `${userUrl}/inbox`,
    outbox: `${userUrl}/outbox`,
    followers: `${userUrl}/followers`,
    publicKey: {
      id: `${userUrl}#main-key`,
      owner: `${userUrl}`,
      publicKeyPem,
    },
  }
})


router.post("/users/:id/inbox", async ctx => {
  const id = ctx.params.id
  if (!id) return

  const user = data.users[id]
  if (!user) return

  const body = ctx.request.body()
  if (!body || body.type !== "json") return
  const json = await body.value
  if (!json) return

  const userUrl = `https://${data.instance}/users/${id}`

  if (json.type === "Follow") {
    console.log("Followed by", json.actor)
    user.followers.push(json.actor)
    saveData()
    ctx.response.body = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Accept",
      actor: userUrl,
      object: json,
    }
  } else if (json.type === "Undo") {
    console.log("Unfollowed by", json.actor)
    user.followers = user.followers.filter(f => f !== json.actor)
    saveData()
    ctx.response.body = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Undo",
      actor: userUrl,
      object: json,
    }
  } else if (json.type === "Create") {
    if (json.object.type === "Note") {
      console.log("Note by", json.actor, json.object.content)
      user.outbox.push({
        id: json.object.id,
        content: json.object.content,
      })
      saveData()
      ctx.response.body = {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Create",
        actor: userUrl,
        object: {
          ...json.object,
          id: `${userUrl}/posts/${Math.random()}`,
          to: json.object.to,
          cc: json.object.cc,
          attributedTo: userUrl,
          inReplyTo: json.object.inReplyTo,
          published: new Date().toISOString(),
          url: `${userUrl}/posts/${Math.random()}`,
        },
      }
    }
  } else if (json.type === "Delete") {
    console.log("Delete by", json.actor, json.object)
    user.outbox = user.outbox.filter(o => o.id !== json.object.id)
    saveData()
    ctx.response.body = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Delete",
      actor: userUrl,
      object: json,
    }
  }
})


router.get("/users/:id/followers", ctx => {
  const id = ctx.params.id
  if (!id) return
  const user = data.users[id]
  if (!user) return
  const userUrl = `https://${data.instance}/users/${id}`
  ctx.response.body = {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "OrderedCollection",
    id: `${userUrl}/followers`,
    totalItems: user.followers.length,
    orderedItems: user.followers.map(id => ({ type: "Person", id, url: id })),
  }
})

app.use(await RateLimiter({
  windowMs: 1000,
  max: 10,
  headers: true,
  message: "Too many requests, please try again later.",
  statusCode: 429,
  onRateLimit: ctx => {
    console.log("[RATE LIMIT]", ctx.request)
  },
}))

app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`)
  await next()
})

app.use(router.routes())
app.use(router.allowedMethods())

const envPort = Deno.env.get("PORT")
const port = envPort ? parseInt(envPort) : 3000
console.log(`Listening on http://localhost:${port}`)
await app.listen({ port })
