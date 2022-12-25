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

import { DB } from "https://deno.land/x/sqlite/mod.ts"
import { sha256 } from "https://denopkg.com/chiefbiiko/sha256/mod.ts"

export default async function (manifestDomain: string, db: DB) {
  try {
    const nodeManifestData = await fetch(`https://${manifestDomain}/.well-known/nodeinfo`)
    const nodeManifestInfo = await nodeManifestData.json()
    const nodePath = nodeManifestInfo.links[0].href
    const domain = new URL(nodePath).hostname
    const nodeData = await fetch(nodePath)
    const nodeText = await nodeData.text()
    const hash = sha256(nodeText, "utf8", "hex")
    const instance = db.query<any>(
      "SELECT hash FROM instances WHERE domain = ?",
      [domain]
    )
    if(
      instance.length === 0
      || instance[0][0] !== hash
    ) {
      console.log(
        `[DISCOVER ${instance.length === 0 ? "ADD" : "UPDATE"} INSTANCE] ${domain}`
      )
      const nodeInfo = JSON.parse(nodeText)
      db.query(
        `INSERT OR REPLACE INTO instances VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          null,
          domain,
          hash,
          Date.now(),
          nodeInfo?.software?.name ?? null,
          nodeInfo?.software?.version ?? null,
          nodeInfo?.openRegistrations ?? null,
          nodeInfo?.usage?.users?.total ?? null,
          nodeInfo?.usage?.localPosts ?? null,
        ]
      )
    }
  } catch (e) {
    console.error("[DISCOVER ERROR]", e)
  }
}
