const base = require('../base')

const xtypes = new Map()
xtypes.set(base.Int64, 'Int64')
xtypes.set(base.Uint64, 'Uint64')
xtypes.set(base.Complex64, 'Complex64')
xtypes.set(base.Complex128, 'Complex128')

function serialize (model) {
  return JSON.stringify(model, (key, value) => {
    // if (key === 'tensor_content') {
    //   return undefined
    // }

    if (value instanceof Uint8Array) {
      if (value.length <= 16) {
        return {
          xtype: 'Uint8Array',
          value: value.reduce((s, v) => s + v.toString(16).padStart(2, '0'), ''),
        }
      }
      return undefined
    }

    if (value && value.constructor && xtypes.has(value.constructor)) {
      return {
        xtype: xtypes.get(value.constructor),
        value: {
          ...value,
        },
      }
    }

    return value
  })
}

module.exports = {
  serialize,
}
