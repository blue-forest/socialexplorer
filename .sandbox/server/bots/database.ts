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
import { ActivityData, BotData, BotId, ObjectData } from "./types.ts"
import { generateKeyPair } from "./helpers.ts"

const db = new SQLite("data.sqlite")

db.execute(
  "CREATE TABLE IF NOT EXISTS bots ("
    + "id TEXT PRIMARY KEY,"
    + "name TEXT NOT NULL,"
    + "summary TEXT NOT NULL,"
    + "public TEXT NOT NULL,"
    + "private TEXT NOT NULL,"
    + "date INTEGER NOT NULL"
    + ")"
)

db.execute(
  "CREATE TABLE IF NOT EXISTS followers ("
    + "bot TEXT NOT NULL,"
    + "follower TEXT NOT NULL,"
    + "date INTEGER NOT NULL,"
    + "FOREIGN KEY (bot) REFERENCES bots(id) ON DELETE CASCADE,"
    + "PRIMARY KEY (bot, follower)"
    + ")"
)

db.execute(
  "CREATE TABLE IF NOT EXISTS objects ("
    + "id TEXT PRIMARY KEY,"
    + "type TEXT NOT NULL,"
    + "bot TEXT NOT NULL,"
    + "content TEXT NOT NULL,"
    + "date INTEGER NOT NULL,"
    + "FOREIGN KEY (bot) REFERENCES bots(id) ON DELETE CASCADE"
    + ")"
)

db.execute(
  "CREATE TABLE IF NOT EXISTS activities ("
    + "id TEXT PRIMARY KEY,"
    + "type TEXT NOT NULL,"
    + "bot TEXT NOT NULL,"
    + "object TEXT NOT NULL,"
    + "date INTEGER NOT NULL,"
    + "FOREIGN KEY (bot) REFERENCES bots(id) ON DELETE CASCADE,"
    + "FOREIGN KEY (object) REFERENCES objects(id) ON DELETE CASCADE"
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
      "INSERT OR REPLACE INTO bots (id, name, summary, public, private, date) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, summary, keyPair.public, keyPair.private, Date.now()],
    )
  },
  getBot: (id: BotId): BotData | undefined => {
    const [bot] = db.query<any>(
      "SELECT name, summary, public, private FROM bots WHERE id = ?",
      [id],
    )
    if(bot) {
      return {
        name: bot[0],
        summary: bot[1],
        publicKey: bot[2],
        privateKey: bot[3],
      }
    }
  },

  addFollower: (bot: BotId, follower: string) => {
    db.query(
      "INSERT OR REPLACE INTO followers (bot, follower, date) VALUES (?, ?, ?)",
      [bot, follower, Date.now()],
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

  createObject: (id: string, data: ObjectData) => {
    db.query(
      "INSERT OR REPLACE INTO objects (id, type, bot, content, date) VALUES (?, ?, ?, ?, ?)",
      [id, data.type, data.bot, data.content, data.date.getTime()],
    )
  },
  getObject: (id: string): ObjectData | undefined => {
    const [_object] = db.query<any>(
      "SELECT type, bot, content, date FROM objects WHERE id = ?",
      [id],
    )
    if(_object) {
      return {
        type: _object[0],
        bot: _object[1],
        content: _object[2],
        date: new Date(_object[3]),
      }
    }
  },

  createActivity: (id: string, data: ActivityData) => {
    db.query(
      "INSERT OR REPLACE INTO activities (id, type, bot, object, date) VALUES (?, ?, ?, ?, ?)",
      [id, data.type, data.bot, data.object, data.date.getTime()],
    )
  },
  getActivity: (id: string): ActivityData | undefined => {
    const [activity] = db.query<any>(
      "SELECT type, bot, object, date FROM activities WHERE id = ?",
      [id],
    )
    if(activity) {
      return {
        type: activity[0],
        bot: activity[1],
        object: activity[2],
        date: new Date(activity[3]),
      }
    }
  },
}
