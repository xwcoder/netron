const fs = require('node:fs/promises')
const path = require('node:path')
const { performance } = require('node:perf_hooks')
const protobuf = require('./protobuf')

const { parseArgs } = require('./node/parse-args')
const { logger } = require('./node/logger')
const { checkConfig } = require('./node/check-config')
const { filterFiles } = require('./node/filter-files')
const { parse } = require('./node/parse')
const { serialize } = require('./node/serialize')
const { save } = require('./node/save')
require('./node/perf')

global.protobuf = protobuf

const sleep = (time = 0) => new Promise((resolve) => setTimeout(resolve, time))

class Host {
  require(id) {
    return Promise.resolve(require(id))
  }

  request(file, encoding, base) {
    logger.log('#request:', file)
    return fs.readFile(path.join(__dirname, file), encoding)
  }

  event() {
  }

  exception() {
  }
}

async function main() {
  logger.log('netron start...')

  performance.mark('start')
  // Parse command line arguments
  logger.log('argv:', process.argv)
  const config = parseArgs()
  logger.log('config:', config)

  // Check config
  try {
    checkConfig(config)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }

  const dir = path.resolve(process.cwd(), config.d)
  const out = path.resolve(process.cwd(), config.o)

  let files
  try {
    files = await filterFiles(dir)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }

  if (!files || !files.length) {
    logger.log(`There is no model file in ${dir}`)
    process.exit(0)
  }

  logger.log('model list:', files)

  await fs.mkdir(out, { recursive: true })

  for (const file of files) {
    try {
      logger.log(`parsing: ${file}`)
      performance.mark('start-item')
      const model = await parse(file)

      performance.mark('serialize')
      const content = serialize(model)
      performance.measure('serialize', 'serialize')

      performance.mark('save')
      await save(content, file, dir, out)
      performance.measure('save', 'save')
      performance.measure('time cost', 'start-item')
      await sleep()
    } catch (e) {
      console.error(`Fail: ${file}`, e)
    }
  }

  performance.measure('total time cost', 'start')
}

module.exports = {
  Host,
}

if (require.main) {
  main()
}

