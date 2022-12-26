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
import { BotData, BotId, ObjectData } from "./types.ts"
import { generateKeyPair, generateUUID } from "./helpers.ts"
import * as config from "./config.ts"

const db = new SQLite("data.sqlite")

db.execute(
  "CREATE TABLE IF NOT EXISTS bots ("
    + "id TEXT PRIMARY KEY,"
    + "name TEXT NOT NULL,"
    + "summary TEXT NOT NULL,"
    + "public TEXT NOT NULL,"
    + "private TEXT NOT NULL,"
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
  "CREATE TABLE IF NOT EXISTS activities ("
    + "id TEXT PRIMARY KEY,"
    + "type TEXT NOT NULL,"
    + "bot TEXT NOT NULL,"
    + "date INTEGER NOT NULL DEFAULT (strftime('%s','now')),"
    + "object TEXT NOT NULL,"
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
      "INSERT OR REPLACE INTO bots (id, name, summary, public, private) VALUES (?, ?, ?, ?, ?)",
      [id, name, summary, keyPair.public, keyPair.private],
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

  addMessage: (bot: BotId, content: any): {
    note: string,
    create: string,
  } => {
    const commonValues = {
      "@context": "https://www.w3.org/ns/activitystreams",
      to: "https://www.w3.org/ns/activitystreams#Public",
      published: new Date().toISOString(),
    }

    const messagesURL = `https://${config.INSTANCE}/messages/`
    const botURL = `https://${config.INSTANCE}/bots/${bot}`

    const noteId = generateUUID()
    const noteMessage = {
      id: messagesURL + noteId,
      type: "Note",
      ...commonValues,
      attributedTo: botURL,
      content,
    }

    db.query(
      "INSERT OR REPLACE INTO messages (id, bot, content) VALUES (?, ?, ?)",
      [noteId, bot, JSON.stringify(noteMessage)],
    )

    const createId = generateUUID()
    const createMessage = {
      id: messagesURL + createId,
      type: "Create",
      ...commonValues,
      actor: botURL,
      object: `https://${config.INSTANCE}/messages/${noteId}`
    }

    db.query(
      "INSERT OR REPLACE INTO messages (id, bot, content) VALUES (?, ?, ?)",
      [createId, bot, JSON.stringify(createMessage)],
    )

    return { note: noteId, create: createId }
  },
  getMessage: (id: string): ObjectData | undefined => {
    const [message] = db.query<any>(
      "SELECT bot, date, content FROM messages WHERE id = ?",
      [id],
    )
    if(message) {
      return {
        bot: message[0],
        date: new Date(message[1]),
        content: JSON.parse(message[2]),
      }
    }
  }
}
