import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const dataPath = new URL('../data/devtools.json', import.meta.url)
const devtools = JSON.parse(await readFile(dataPath, 'utf8'))

assert.ok(Array.isArray(devtools), 'data/devtools.json must contain an array')
assert.ok(devtools.length >= 500, `Expected at least 500 DevTools, found ${devtools.length}`)

const slugs = new Set()
const hosts = new Set()

for (const tool of devtools) {
  assert.deepEqual(Object.keys(tool).sort(), ['description', 'name', 'slug', 'url'])
  assert.match(tool.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid slug: ${tool.slug}`)
  assert.ok(tool.name.trim(), `Missing name for ${tool.slug}`)
  assert.ok(tool.description.trim(), `Missing description for ${tool.slug}`)
  assert.ok(tool.description.length <= 240, `Description is too long for ${tool.slug}`)
  assert.equal(slugs.has(tool.slug), false, `Duplicate slug: ${tool.slug}`)
  slugs.add(tool.slug)

  const url = new URL(tool.url)
  assert.equal(url.protocol, 'https:', `Non-HTTPS URL for ${tool.slug}: ${tool.url}`)
  assert.equal(url.username, '', `URL contains a username for ${tool.slug}`)
  assert.equal(url.password, '', `URL contains a password for ${tool.slug}`)
  assert.equal(url.search, '', `URL contains a query for ${tool.slug}`)
  assert.equal(url.hash, '', `URL contains a fragment for ${tool.slug}`)

  const host = url.hostname.replace(/^www\./, '')
  assert.equal(hosts.has(host), false, `Duplicate hostname: ${host}`)
  hosts.add(host)
}

console.log(`DevTools data is valid (${devtools.length} entries).`)
