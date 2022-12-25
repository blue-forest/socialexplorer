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
import { BotData, BotName } from "./types.ts"

const db = new SQLite("data.sqlite")

db.execute(
  "CREATE TABLE IF NOT EXISTS bots ("
    + "name TEXT PRIMARY KEY,"
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
    + "FOREIGN KEY (bot) REFERENCES bots(name) ON DELETE CASCADE,"
    + "PRIMARY KEY (bot, follower)"
    + ")"
)

db.execute(
  "CREATE TABLE IF NOT EXISTS messages ("
    + "id TEXT PRIMARY KEY,"
    + "bot TEXT NOT NULL,"
    + "date INTEGER NOT NULL DEFAULT (strftime('%s','now')),"
    + "content TEXT NOT NULL,"
    + "FOREIGN KEY (bot) REFERENCES bots(name) ON DELETE CASCADE"
    + ")"
)

export const DB = {
  registerBot: (name: BotName, publicKey: string, privateKey: string) => {
    db.query(
      "INSERT OR REPLACE INTO bots (name, pubKey, privKey) VALUES (?, ?, ?)",
      [name, publicKey, privateKey]
    )
  },
  getBot: (name: string): BotData | undefined => {
    const [bot] = db.query<any>(
      "SELECT * FROM bots WHERE name = ?",
      [name],
    )
    if(bot) {
      return {
        name: bot[0],
        privKey: bot[1],
        pubKey: bot[2],
        created: new Date(bot[3]),
      }
    }
  },

  addFollower: (bot: BotName, follower: string) => {
    db.query(
      "INSERT OR REPLACE INTO followers (bot, follower) VALUES (?, ?)",
      [bot, follower]
    )
  },
  removeFollower: (bot: BotName, follower: string) => {
    db.query(
      "DELETE FROM followers WHERE bot = ? AND follower = ?",
      [bot, follower]
    )
  },
  getFollowers: (bot: BotName): string[] => {
    return db.query<any>(
      "SELECT follower FROM followers WHERE bot = ?",
      [bot],
    ).map(follower => follower[0])
  },

  addMessage: (id: string, bot: BotName, content: string) => {
    db.query(
      "INSERT OR REPLACE INTO messages (id, bot, content) VALUES (?, ?, ?)",
      [id, bot, content]
    )
  },
}
