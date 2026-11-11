import { promises as fsp } from 'node:fs'

const source = await fsp.readFile(new URL('../lib/.client.cjs.js', import.meta.url), 'utf8')
const wrapped = `window.__ModuleLoader__.load({
  id: 'dsh-fishkeeper',
  factory(require) {
    const module = { exports: {} };
    (function (module, exports, require) {
${source}
    })(module, module.exports, require);
    return module.exports;
  },
});
`
await fsp.writeFile(new URL('../lib/client.js', import.meta.url), wrapped, 'utf8')
await fsp.rm(new URL('../lib/.client.cjs.js', import.meta.url), { force: true })
console.log(`wrote lib/client.js (${Buffer.byteLength(wrapped)} bytes)`)
