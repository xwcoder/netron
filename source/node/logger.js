const time = () => new Date().toLocaleString()

const logger = {}

;['log', 'info', 'error', 'warn', 'debug'].forEach((method) => {
  logger[method] = (...args) => {
    console[method](`[${time()}]`, ...args)
  }
})

module.exports = {
  logger,
}
