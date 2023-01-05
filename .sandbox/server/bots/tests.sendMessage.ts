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

import { DB } from "./database.ts"
import { activityToMessage, generateUUID, objectToMessage } from "./helpers.ts"
import { ActivityData, ObjectData } from "./types.ts"

const bot = "test1"

const noteData: ObjectData = {
  type: "Note",
  bot,
  content: "Hello World 1",
  date: new Date(),
}

const noteId = generateUUID()

DB.createObject(noteId, noteData)

const createData: ActivityData = {
  type: "Create",
  bot,
  object: noteId,
  date: new Date(),
}

const createId = generateUUID()

DB.createActivity(createId, createData)

for (const follower of DB.getFollowers(bot)) {
  const note = objectToMessage(noteId, noteData)
  const create = activityToMessage(
    createId,
    createData,
    note,
    follower,
  )
  console.log(create)
}
