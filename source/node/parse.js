const fs = require('node:fs/promises')
const { performance } = require('node:perf_hooks')

const base = require('../base')
const { ModelFactoryService } = require('../view')

const { Context } = require('./context')

const { BinaryStream } = base

async function parse(file) {
  const { Host } = require('../node')

  const host = new Host()
  const modelFactory = new ModelFactoryService(host)

  performance.mark('readFile')
  const buffer = await fs.readFile(file)
  performance.measure('readFile', 'readFile')

  performance.mark('parse')

  const stream = new BinaryStream(new Uint8Array(buffer.buffer))
  const context = new Context(host, file, null, stream)
  const model = await modelFactory.open(context)

  performance.measure('parse', 'parse')

  return model
}

module.exports = {
  parse,
}
