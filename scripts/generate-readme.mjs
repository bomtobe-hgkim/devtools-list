import { readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const dataPath = new URL('data/devtools.json', root)
const readmePath = new URL('README.md', root)
const siteUrl = 'https://scalingdevtools.com'
const repositoryUrl = 'https://github.com/jackbridger/devtools-list'

function escapeTableCell(value) {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim()
}

function displayUrl(value) {
  const url = new URL(value)
  return `${url.hostname.replace(/^www\./, '')}${url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '')}`
}

function renderReadme(devtools) {
  const rows = [...devtools]
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
    .map((tool) => {
      const name = escapeTableCell(tool.name)
      const url = escapeTableCell(tool.url)
      const label = escapeTableCell(displayUrl(tool.url))
      const description = escapeTableCell(tool.description)
      return `| ${name} | [${label}](${url}) | ${description} |`
    })
    .join('\n')

  return `<!-- This file is generated from data/devtools.json. Run \`npm run generate\` after editing the directory. -->

# Developer Tools Directory

A comprehensive list of ${devtools.length} developer tools, maintained by [Scaling DevTools](${siteUrl}) as part of our [DevTools landing-page gallery](${siteUrl}/landing-pages).

We track these companies’ homepages to help DevTools founders and teams study how developer products explain themselves. This repository is public so the directory can improve with the community.

Missing a DevTool? [Suggest it for the landing-page gallery](${siteUrl}/landing-pages/suggest), [open an issue](${repositoryUrl}/issues/new?template=add-a-devtool.yml), or send a pull request that updates [\`data/devtools.json\`](./data/devtools.json). After changing the directory, run \`npm run generate\` so this table stays in sync.

| Name | URL | Description |
| --- | --- | --- |
${rows}
`
}

const devtools = JSON.parse(await readFile(dataPath, 'utf8'))
const expected = renderReadme(devtools)

if (process.argv.includes('--check')) {
  const current = await readFile(readmePath, 'utf8').catch(() => '')
  if (current !== expected) {
    console.error('README.md is out of sync with data/devtools.json. Run `npm run generate`.')
    process.exit(1)
  }
  console.log(`README.md is up to date with ${devtools.length} DevTools.`)
} else {
  await writeFile(readmePath, expected)
  console.log(`Generated README.md with ${devtools.length} DevTools.`)
}
