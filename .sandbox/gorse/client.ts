
const URL = "http://127.0.0.1:8088"

export default {
  users: {
    all: () => request("GET", "users"),
    create: (id: string) => request(
      "POST",
      "user",
      { "UserId": id },
    ),
  },
  items: {
    all: async () => {
      const response = await request("GET", "items")
      //console.log("[ITEMS]", response)
      return (response.Items as any[]).map(i => ({
        id: i.ItemId,
      }))
    },
    create: (item: {
      id: string
      url: string
      date: string
      categories: string[]
      labels: string[]
    }) => request(
      "POST",
      "item",
      {
        "ItemId": item.id,
        "Comment": item.url,
        "Categories": item.categories,
        "Labels": item.labels,
        "Timestamp": new Date().toISOString(),
        "IsHidden": false,
      },
    ),
    delete: (id: string) => request(
      "DELETE",
      `item/${id}`,
    ),
  },
}

async function request(method: string, path: string, body?: any) {
  const input = `${URL}/api/${path}`
  console.log("[REQUEST]", input, body)
  const response  = await fetch(`${URL}/api/${path}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { "Content-Type": "application/json" } : undefined,
  })
  const text = await response.text()
  if(response.status === 200) {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  } else {
    console.error("[ERROR]", response.status, response.statusText, text)
  }
}
