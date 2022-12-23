
export async function instanceSearch(instance: string, search: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)
  const response = await fetch(`https://${instance}/api/v2/search?q=${search}&limit=5`, {
    signal: controller.signal,
  })
  clearTimeout(timeout)
  return response
}
