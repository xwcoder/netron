const fs = require('node:fs/promises')
const path = require('node:path')
const zlib = require('node:zlib')

async function save (content, file, baseDir, out) {
  const outFile = path.relative(baseDir, file).split(path.sep).join('_') + '.json.gz'
  return fs.writeFile(path.join(out, outFile), zlib.gzipSync(content))
}

module.exports = {
  save,
}
