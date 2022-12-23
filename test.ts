
const instances: {
  include: string[]
  exclude: string[]
} = JSON.parse(Deno.readTextFileSync("instances.json"))

const done = new Set()

for (const instance of [ ...instances.include, ...instances.exclude ]) {
  if (done.has(instance)) {
    console.error("Duplicate instance", instance)
    Deno.exit(1)
  }
  done.add(instance)
}

await Promise.all([
  ...instances.include.map(async instance => {
    try {
      const response = await testInstance(instance)
      if (response.status !== 200) {
        console.error("Instance should be working", instance)
        console.error(response.status, await response.text())
        Deno.exit(1)
      }
    } catch (error) {
      console.error("Instance should be working", instance)
      console.error(error)
      Deno.exit(1)
    }
  }),
  ...instances.exclude.map(async instance => {
    try {
      const response = await testInstance(instance)
      if (response.status === 200) {
        console.error("Instance should not be working", instance)
        Deno.exit(1)
      }
    } catch (error) {}
  }),
])

function testInstance(instance: string) {
  return fetch(`https://${instance}/api/v2/search?q=hello&limit=5`)
}
