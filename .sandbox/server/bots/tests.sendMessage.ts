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
