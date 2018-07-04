const fs = require('fs-extra')
const nPath = require('path')

const itemType = stat => {
  if (stat.isFile()) {
    return 'file'
  }

  if (stat.isDirectory()) {
    return 'dir'
  }

  return ''
}

const directoryTree = async (path = __dirname, onEachFile) => {
  const name = nPath.basename(path)
  let item = { path, name }

  try {
    const stat = await fs.stat(path)

    switch (itemType(stat)) {
      case 'file':
        item.extension = nPath.extname(item.path).toLowerCase()
        item.size = stat.size
        item.isFile = true

        if (onEachFile && typeof onEachFile === 'function') {
          item = await onEachFile(item)
        }
        break
      case 'dir':
        try {
          item.children = await fs.readdir(path)
          item.isFile = false

          const recurse = child => {
            return new Promise(async (res, rej) => {
              try {
                const i = await directoryTree(
                  nPath.join(path, child),
                  onEachFile
                )
                res(i)
              } catch (e) {
                res({})
              }
            })
          }

          const setChildren = item.children.map(child => {
            return recurse(child).then(c => c)
          })

          item.children = await Promise.all(setChildren)
          item.children = item.children.filter(i => Object.keys(i).length) // don't include empty items
          item.size = item.children.reduce((prev, cur) => prev + cur.size, 0)
        } catch (e) {
          return {}
        }

        break
      default:
        return {}
    }
  } catch (e) {
    return {}
  }

  return item
}

module.exports = directoryTree
