const { PerformanceObserver } = require('node:perf_hooks')
const { logger } = require('./logger')

const obs = new PerformanceObserver((items) => {
  items.getEntries()
    .sort((a, b) => (a.startTime + a.duration) - (b.startTime + b.duration))
    .forEach((item) => {
      logger.log(`[perf] ${item.name}:`, `${item.duration.toFixed(2)}ms`)
    })
})

obs.observe({ type: 'measure' })

