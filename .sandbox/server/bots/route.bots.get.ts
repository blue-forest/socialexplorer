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

import * as config from "./config.ts"
import { DB } from "./database.ts"

export default function(id: string | null) {
  if(!id) return
  const bot = DB.getBot(id)
  if(!bot) return
  const botURL = `https://${config.INSTANCE}/bots/${id}`
  return {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      "https://w3id.org/security/v1",
    ],
    type: "Service",
    id: botURL,
    preferredUsername: id,
    name: bot.name,
    summary: bot.summary,
    icon: "https://raw.githubusercontent.com/blue-forest/socialexplorer/master/icons/test.jpg",
    publicKey: {
      id: `${botURL}#main-key`,
      owner: `${botURL}`,
      publicKeyPem: "-----BEGIN PUBLIC KEY-----\n"
        + bot.publicKey
        + "\n-----END PUBLIC KEY-----",
    },
    inbox: `${botURL}/inbox`,
    followers: `${botURL}/followers`,
    manuallyApprovesFollowers: false,
    discoverable: true,
  }
}
