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

import { DB as SQLite } from "https://deno.land/x/sqlite/mod.ts"
import { BotData, BotId } from "./types.ts"
import { generateKeyPair } from "./helpers.ts"

const db = new SQLite("data.sqlite")

db.execute(
  "CREATE TABLE IF NOT EXISTS bots ("
    + "id TEXT PRIMARY KEY,"
    + "name TEXT NOT NULL,"
    + "summary TEXT NOT NULL,"
    + "privKey TEXT NOT NULL,"
    + "pubKey TEXT NOT NULL,"
    + "created INTEGER NOT NULL DEFAULT (strftime('%s','now'))"
    + ")"
)

db.execute(
  "CREATE TABLE IF NOT EXISTS followers ("
    + "bot TEXT NOT NULL,"
    + "follower TEXT NOT NULL,"
    + "created INTEGER NOT NULL DEFAULT (strftime('%s','now')),"
    + "FOREIGN KEY (bot) REFERENCES bots(id) ON DELETE CASCADE,"
    + "PRIMARY KEY (bot, follower)"
    + ")"
)

db.execute(
  "CREATE TABLE IF NOT EXISTS messages ("
    + "id TEXT PRIMARY KEY,"
    + "bot TEXT NOT NULL,"
    + "date INTEGER NOT NULL DEFAULT (strftime('%s','now')),"
    + "content TEXT NOT NULL,"
    + "FOREIGN KEY (bot) REFERENCES bots(id) ON DELETE CASCADE"
    + ")"
)

export const DB = {
  registerBot: async (
    id: BotId,
    name: string,
    summary: string,
  ) => {
    const keyPair = await generateKeyPair()
    db.query(
      "INSERT OR REPLACE INTO bots (id, name, summary, pubKey, privKey) VALUES (?, ?, ?, ?, ?)",
      [id, name, summary, keyPair.public, keyPair.private],
    )
  },
  getBot: (id: BotId): BotData | undefined => {
    const [bot] = db.query<any>(
      "SELECT name, summary, pubKey, privKey FROM bots WHERE id = ?",
      [id],
    )
    if(bot) {
      return {
        name: bot[0],
        summary: bot[1],
        privateKey: bot[2],
        publicKey: bot[3],
      }
    }
  },

  addFollower: (bot: BotId, follower: string) => {
    db.query(
      "INSERT OR REPLACE INTO followers (bot, follower) VALUES (?, ?)",
      [bot, follower],
    )
  },
  removeFollower: (bot: BotId, follower: string) => {
    db.query(
      "DELETE FROM followers WHERE bot = ? AND follower = ?",
      [bot, follower],
    )
  },
  getFollowers: (bot: BotId): string[] => {
    return db.query<any>(
      "SELECT follower FROM followers WHERE bot = ?",
      [bot],
    ).map(follower => follower[0])
  },

  addMessage: (id: string, bot: BotId, content: string) => {
    db.query(
      "INSERT OR REPLACE INTO messages (id, bot, content) VALUES (?, ?, ?)",
      [id, bot, content],
    )
  },
}
