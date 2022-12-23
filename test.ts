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

const done = new Set()

let update = false

for (const instance of [ ...instances.include, ...instances.exclude ]) {
  if (done.has(instance)) {
    console.error("Duplicate instance", instance)
    const index = instances.include.indexOf(instance)
    instances.include.splice(index, 1)
    update = true
  }
  done.add(instance)
}

const promises = [
  ...instances.include.map(async instance => {
    let ok = true
    try {
      const response = await instanceSearch(instance, search)
      if (response.status !== 200) {
        console.error("include -> exclude", instance, response.status)
        //console.error(response.status, await response.text())
        ok = false
      }
    } catch (e) {
      console.error("include -> exclude", instance)
      //console.error(error)
      ok = false
    }
    if (!ok) {
      const index = instances.include.indexOf(instance)
      instances.include.splice(index, 1)
      instances.exclude.push(instance)
      update = true
    }
  }),
  ...instances.exclude.map(async instance => {
    try {
      const response = await instanceSearch(instance, search)
      if (response.status === 200) {
        console.error("include <- exclude", instance)
        const index = instances.exclude.indexOf(instance)
        instances.exclude.splice(index, 1)
        instances.include.push(instance)
        update = true
      }
    } catch (e) {}
  }),
]

const PARALLEL = true

if(PARALLEL) {
  await Promise.all(promises)
} else {
  for(const promise of promises) await promise
}

if (update) {
  instances.include.sort()
  instances.exclude.sort()
  Deno.writeTextFileSync("instances.json", JSON.stringify(instances, null, 2))
}
