import client from "./client.ts"

for(const item of await client.items.all()) {
  console.log("delete", await client.items.delete(item.id))
}
