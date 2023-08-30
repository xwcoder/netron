function isParam (arg = '') {
  return arg.startsWith('-')
}

function getParamName (arg) {
  return arg.slice(1)
}

function parseArgs () {
  const config = {}
  const args = process.argv.slice(2)

  for (let index = 0; index < args.length; index += 1) {
    const item = args[index]
    if (isParam(item)) {
      const k = getParamName(item)
      if (!isParam(args[index + 1])) {
        config[k] = args[index + 1]
        index += 1
      } else {
        config[k] = true
      }
    }
  }

  return config
}

module.exports = {
  parseArgs,
}
