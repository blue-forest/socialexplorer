
export async function request(
  method: string,
  url: string,
  body?: any,
  token?: string,
) {
  try {
    const response  = await fetch(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      }
    })
    if(response.status === 200) {
      return safelyParseJSON(await response.text())
    }
  } catch(e) {
    console.error("[ERROR - REQUEST]", e)
    return null
  }
}

function safelyParseJSON(json: string) {
  try {
    return JSON.parse(json)
  } catch {
    return json
  }
}
