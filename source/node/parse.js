const fs = require('node:fs')
const { performance } = require('node:perf_hooks')

const base = require('../base')
const { ModelFactoryService } = require('../view')

const { Context } = require('./context')

const { BinaryStream } = base

const readFile = (path) => new Promise((resolve) => {
  const chunks = []
  const stream = fs.createReadStream(path, { highWaterMark: 10 * 1024 * 1024})

  stream.on('readable', () => {
    let chunk;
    while ((chunk = stream.read()) !== null) {
      chunks.push(chunk)
    }
  })

  stream.on('end', () => {
    stream.close()
    resolve(Buffer.concat(chunks))
  })
})

async function parse(file) {
  const { Host } = require('../node')

  const host = new Host()
  const modelFactory = new ModelFactoryService(host)

  performance.mark('readFile')
  const buffer = await readFile(file)
  performance.measure('readFile', 'readFile')

  performance.mark('parse')

  const stream = new BinaryStream(new Uint8Array(buffer))
  const context = new Context(host, file, null, stream)
  const model = await modelFactory.open(context)

  performance.measure('parse', 'parse')

  return model
}

module.exports = {
  parse,
}
