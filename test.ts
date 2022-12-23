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

const instances: {
  include: string[]
  exclude: string[]
} = JSON.parse(Deno.readTextFileSync("instances.json"))

const done = new Set()

for (const instance of [ ...instances.include, ...instances.exclude ]) {
  if (done.has(instance)) {
    console.error("Duplicate instance", instance)
    Deno.exit(1)
  }
  done.add(instance)
}

await Promise.all([
  ...instances.include.map(async instance => {
    try {
      const response = await testInstance(instance)
      if (response.status !== 200) {
        console.error("Instance should be working", instance)
        console.error(response.status, await response.text())
        Deno.exit(1)
      }
    } catch (error) {
      console.error("Instance should be working", instance)
      console.error(error)
      Deno.exit(1)
    }
  }),
  ...instances.exclude.map(async instance => {
    try {
      const response = await testInstance(instance)
      if (response.status === 200) {
        console.error("Instance should not be working", instance)
        Deno.exit(1)
      }
    } catch (error) {}
  }),
])

function testInstance(instance: string) {
  return fetch(`https://${instance}/api/v2/search?q=hello&limit=5`)
}
