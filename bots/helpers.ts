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

import { RouterContext } from "https://deno.land/x/oak/mod.ts"
import * as config from "./config.ts"
import { ActivityData, ObjectData } from "./types.ts"

export function handleResponse(
  context: RouterContext<any, any, any>,
  response?: any,
) {
  if(response) {
    context.response.body = response
  }
}

async function exportKey(format: "spki" | "pkcs8", key: CryptoKey) {
  const base = await crypto.subtle.exportKey(format, key)
  const bytes = String.fromCharCode(...new Uint8Array(base))
  return btoa(bytes)
}

export async function generateKeyPair(): Promise<{ public: string, private: string }> {
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  )
  return {
    public: await exportKey("spki", publicKey),
    private: await exportKey("pkcs8", privateKey),
  }
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function objectToMessage(id: string, data: ObjectData) {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `https://${config.INSTANCE}/objects/${id}`,
    type: data.type,
    attributedTo: `https://${config.INSTANCE}/bots/${data.bot}`,
    content: data.content,
    published: data.date.toISOString(),
    to: "https://www.w3.org/ns/activitystreams#Public",
  }
}

export function activityToMessage(
  id: string,
  data: ActivityData,
  _object: any,
  follower?: string,
) {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `https://${config.INSTANCE}/activities/${id}`,
    type: data.type,
    actor: `https://${config.INSTANCE}/bots/${data.bot}`,
    object: _object,
    ...(follower ? { cc: [follower] } : {}),
    to: "https://www.w3.org/ns/activitystreams#Public",
  }
}
