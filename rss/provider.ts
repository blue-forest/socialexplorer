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

import { DB } from "https://deno.land/x/sqlite/mod.ts"
import { parseFeed } from "https://deno.land/x/rss/mod.ts"
import { Hash } from "https://deno.land/x/checksum/mod.ts"
import urlMetadata from "npm:url-metadata"
import { request } from "../utils.ts"

const language = Deno.args[0]
if(!language) {
  console.error("Please provide a language")
  Deno.exit(1)
}

const feed = Deno.args[1]
if(!feed) {
  console.error("Please provide a feed URL")
  Deno.exit(1)
}

const TOKEN = Deno.env.get("SOCIAL_EXPLORER_TOKEN") || "local"
const API = Deno.env.get("SOCIAL_EXPLORER_API") || "http://localhost:8080"

const cache = new DB("cache.sqlite")
cache.query("CREATE TABLE IF NOT EXISTS rss (url TEXT PRIMARY KEY)")

const response = await fetch(feed)
const data = await parseFeed(await response.text())
for(const entry of data.entries) {
  if(!entry.links[0]?.href) continue
  const url = await getRedirectedURL(entry.links[0].href)
  if(!url) continue
  if(cache.query(
    "SELECT url FROM rss WHERE url = ?", [url]).length !== 0
  ) continue
  let hostname = new URL(url).hostname
  if(hostname.startsWith("www.")) hostname = hostname.slice(4)
  const tags = await extractTags(url)
  if(tags.length === 0) {
    console.error("[ERROR - NO TAGS]", url)
    continue
  }
  const response = await request("POST", `${API}/providers/rss`, {
    id: new Hash("md5").digestString(url).hex(),
    url,
    categories: [ "rss", language, hostname ],
    labels: await extractTags(url),
    date: (entry?.published ? new Date(entry.published) : new Date()).toISOString(),
  }, TOKEN)
  if(response !== null) {
    cache.query("INSERT INTO rss (url) VALUES (?)", [url])
    console.log("[OK]", url)
  }
}

async function extractTags(url: string): Promise<string[]> {
  try {
    const metadata = await urlMetadata(url)
    const lowerTitle = metadata.title.toLowerCase()
    return metadata.keywords
      .split(",")
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length !== 0 && k !== lowerTitle)
  } catch (error) {
    console.error("[ERROR]", error)
    return []
  }
}

export async function getRedirectedURL(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.url
  } catch (e) {
    console.warn(`[WARNING] Could not get redirected URL for ${url}`)
    return url
  }
}
