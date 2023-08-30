function checkConfig (config = {}) {
  if (!config.d) {
    throw new Error('Missing param -d')
  }

  if (!config.o) {
    throw new Error('Missing param -o')
  }
}

module.exports = {
  checkConfig,
}
