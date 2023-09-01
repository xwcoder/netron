const { performance } = require('node:perf_hooks')

const { ModelFactoryService } = require('../view')
const { Context } = require('./context')

async function parse(file) {
  const { Host } = require('../node')

  const host = new Host()
  const modelFactory = new ModelFactoryService(host)

  const context = new Context(host, file)
  performance.mark('readFile')
  await context.open()
  performance.measure('readFile', 'readFile')

  performance.mark('parse')

  const model = await modelFactory.open(context)

  performance.measure('parse', 'parse')

  return model
}

module.exports = {
  parse,
}
