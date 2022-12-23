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

const servers = await fetch("https://api.joinmastodon.org/servers")

const instances: {
  include: string[]
  exclude: string[]
} = JSON.parse(Deno.readTextFileSync("instances.json"))

let update = false

for (const server of await servers.json()) {
  if (
    !instances.include.includes(server.domain)
    && !instances.exclude.includes(server.domain)
  ) {
    update = true
    instances.include.push(server.domain)
  }
}

if (update) {
  instances.include.sort()
  instances.exclude.sort()
  Deno.writeTextFileSync("instances.json", JSON.stringify(instances, null, 2))
}
