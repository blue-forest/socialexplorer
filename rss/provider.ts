import { parse as parseYaml } from "https://deno.land/std/encoding/yaml.ts"

const feeds = parseYaml(await Deno.readTextFile("./feeds.yml")) as {
  [language: string]: {
    [account: string]: {
      url: string
      encoding?: string
    }
  }
}

for (const [language, accounts] of Object.entries(feeds)) {
  for (const [account, options] of Object.entries(accounts)) {
  }
}
