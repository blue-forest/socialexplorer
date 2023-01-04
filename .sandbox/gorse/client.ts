
const URL = "http://127.0.0.1:8088"

export default {
  users: {
    retrieve: () => request("GET", "users"),
    create: (id: string) => request(
      "POST",
      "user",
      { "UserId": id },
    ),
  },
  items: {
    retrieve: () => request("GET", "items"),
    create: (id: string, item: {
      title: string
      description: string
      image: string
      url: string
      categories: string[]
      labels: string[]
    }) => request(
      "POST",
      "item",
      {
        "ItemId": id,
        "IsHidden": false,
        "Title": item.title,
        "Description": item.description,
        "Image": item.image,
        "Url": item.url,
        "Categories": item.categories,
        "Labels": item.labels,
        "Timestamp": new Date().toISOString(),
      },
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
