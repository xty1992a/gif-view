const path = require('path')
const fs = require('fs').promises

const tools = {
  readFile: async (_path) => {
    const blob = await fs.readFile(_path)
    const base64 = blob.toString('base64')
    const ext = path.extname(_path).replace('.', '')
    return [`data:image/${ext};base64`, base64].join(',')
  },
}

window.tools = tools
