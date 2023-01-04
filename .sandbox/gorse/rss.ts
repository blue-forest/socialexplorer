import { parseFeed } from "https://deno.land/x/rss/mod.ts"
import urlMetadata from "npm:url-metadata"
import client from "./client.ts"

const feed = "http://rss.cnn.com/rss/edition.rss"
const feedKeywords = ["cnn", "news", "world"]

const feedResponse = await fetch(feed)
const feedData = await parseFeed(await feedResponse.text())
for(const entry of feedData.entries) {
  const url = entry.links[0].href
  if(!url) continue
  const metadata = await extractMetadata(
    url,
    feedKeywords,
  )
  if(!metadata) continue
  const id = btoa(url)
  console.log("[ITEM]", id, metadata.title, metadata.keywords)
  client.items.create(id, {
    title: metadata.title,
    description: metadata.description,
    image: metadata.image,
    url,
    categories: feedKeywords,
    labels: metadata.keywords,
  })
}

async function extractMetadata(url: string, parentKeywords: string[]): Promise<{
  title: string
  description: string
  image: string
  keywords: string[]
} | undefined> {
  try {
    const metadata = await urlMetadata(url)
    //console.log("[METADATA]", metadata)
    const lowerTitle = metadata.title.toLowerCase()
    return {
      title: metadata.title,
      description: metadata.description,
      image: metadata.image,
      keywords: metadata.keywords.split(",")
        .map(k => k.trim().toLowerCase())
        .filter(k => k !== lowerTitle),
    }
  } catch (error) {
    console.error("[ERROR]", error)
  }
}
