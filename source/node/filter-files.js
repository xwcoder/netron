const fs = require('node:fs/promises')
const path = require('node:path')

const { ModelFactoryService } = require('../view')

async function filterFiles (directory) {
  const { Host } = require('../node')
  const host = new Host()
  const modelFactory = new ModelFactoryService(host)

 const accept = (file) => {
   const ext = path.extname(file)
   return !['.json', '.txt', '.gz', '.zip', '.tar'].includes(ext) && modelFactory.accept(file)
 }

  const files = []
  const dir = await fs.opendir(directory, {
    recursive: true,
  })

  for await (const dirent of dir) {
    if (dirent.isFile() && accept(dirent.path)) {
      files.push(dirent.path)
    }
  }

  return files
}

module.exports = {
  filterFiles,
}
