const path = require('path')
const fs = require('fs').promises
const root = (_path) => path.resolve(__dirname, _path)
const cheerio = require('cheerio')
const shell = require('shelljs')

console.log(process.argv)

const toArray = $List => {
  const result = []
  $List.each((i, n) => result.push(n))
  return result
}

async function run() {
  shell.rm('-rf', './dist/*')
  const file = await fs.readFile(root('src/index.html'), 'utf-8')
  const $ = cheerio.load(file)
  shell.cd('src')
  function mv(el, attr) {
    const link = el.attr(attr)
    if (!link) return
    // 从当前目录移到dist
    const dest = path.dirname(link).replace('..', '../dist') + '/'
    // 创建可能不存在的目录
    shell.mkdir('-p', dest)
    // 搬运资源
    shell.cp(link, dest)
    // 替换引用
    el.attr(attr, link.replace('../', './'))
  }

  /** 搬运依赖 */
  toArray($('script')).forEach(e => mv($(e), 'src'))
  toArray($('link'))
      .forEach(e => {
        const el = $(e)
        if (el.attr('rel') !== 'stylesheet') return
        mv(el, 'href')
      })

  // 保存更改过引用的html


  const html = $.html()
  await fs.writeFile(root('dist/index.html'), html, 'utf-8')

  // 搬运其他的依赖
  shell.cd('..')
  shell.cp('src/gif.png', 'dist/')
  shell.cp('src/preload.js', 'dist/')
  shell.cp('src/plugin.json', 'dist/')

  console.log('编译完成！')
}

run()
