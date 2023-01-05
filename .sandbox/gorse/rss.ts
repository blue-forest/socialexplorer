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

import { parseFeed } from "https://deno.land/x/rss/mod.ts"
import { Hash } from "https://deno.land/x/checksum/mod.ts"
import urlMetadata from "npm:url-metadata"
import client from "./client.ts"

const feed = "http://rss.cnn.com/rss/edition.rss"
const feedKeywords = ["cnn", "news", "world"]

const feedResponse = await fetch(feed)
const feedData = await parseFeed(await feedResponse.text())
for(const entry of feedData.entries) {
  const url = entry.links[0].href
  if(!url) continue
  const metadata = await extractMetadata(url)
  if(!metadata) continue
  const id = new Hash("md5").digestString(url).hex()
  //console.log("[ITEM]", id, url, metadata.keywords)
  client.items.create({
    id,
    url,
    date: (entry?.published || new Date()).toISOString(),
    labels: metadata.keywords,
    categories: feedKeywords,
  })
}

async function extractMetadata(url: string): Promise<{
  //date: string
  keywords: string[]
} | undefined> {
  try {
    const metadata = await urlMetadata(url)
    //console.log("[METADATA]", metadata)
    const lowerTitle = metadata.title.toLowerCase()
    return {
      //date: metadata.date,
      keywords: (metadata.keywords as string).split(",")
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length !== 0 && k !== lowerTitle),
    }
  } catch (error) {
    console.error("[ERROR]", error)
  }
}
