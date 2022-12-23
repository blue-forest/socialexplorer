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

import { instanceSearch } from "./utils.ts"

const search = Deno.args[0]
if(!search) {
  console.error("Missing search term argument")
  Deno.exit(1)
}

const instances: {
  include: string[]
  exclude: string[]
} = JSON.parse(Deno.readTextFileSync("instances.json"))

const added: string[] = []

async function scan(instance: string) {
  console.log("SCAN", instance)
  try {
    const response = await instanceSearch(instance, search)
    if(response.status === 200) {
      const json = await response.json()
      if(json.accounts.length !== 0) {
        for(const account of json.accounts) {
          const domain = account.acct.split("@")[1]
          if(
            domain
            && domain !== instance
            && !added.includes(domain)
            && !instances.include.includes(domain)
            && !instances.exclude.includes(domain)
          ) {
            console.log("==> ADD", domain)
            added.push(domain)
            await scan(domain)
          }
        }
      }
    }
  } catch(e) {}
}

for(const instance of instances.include) {
  await scan(instance)
}

instances.include.push(...added)

instances.include.sort()

Deno.writeTextFileSync("instances.json", JSON.stringify(instances, null, 2))
