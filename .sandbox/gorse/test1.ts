import client from "./client.ts"

console.log("create test1", await client.users.create("test1"))

console.log("users", await client.users.all())

console.log("items", await client.items.all())
