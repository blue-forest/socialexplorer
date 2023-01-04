
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
