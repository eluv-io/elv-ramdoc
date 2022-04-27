const fs = require('fs')
const fse = require('fs-extra')
const Path = require('path')

const {
  applySpec,
  chain,
  defaultTo,
  filter,
  head,
  join,
  map,
  path,
  pipe,
  prop,
  propEq,
  replace,
  split,
} = require('ramda')

const pug = require('pug')
const hljs = require('highlight.js')
const helper = require('jsdoc/util/templateHelper')
const marked = require('marked')

//copy directory content including sub-folders
const copyDir = (sourceDir, destDir) => {
  // create dir if it doesn't exist
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })
  // copy contents
  fse.copy(
    sourceDir,
    destDir,
    err => {if (err) throw Error(err)}
  )
}

const markdownToHtml = function (mdString) {
  return marked.parse(mdString)
}

const prettifyCode = pipe(
  join('\n'),
  replace(/^[ ]{5}/gm, ''),
  s => hljs.highlight(s, {language: 'javascript'}).value
)

const prettifySig = pipe(
  replace(/[.][.][.]/g, '\u2026'),
  replace(/->/g, '\u2192')
)

//  simplifySee :: Array String -> Array String
//
//  Handles any combination of comma-separated and multi-line @see annotations.
const simplifySee = pipe(chain(split(/\s*,\s*/)), map(replace(/^R[.]/, '')))

const titleFilter = pipe(propEq('title'), filter)

const valueProp = chain(prop('value'))

const simplifyData = applySpec({
  access: pipe(prop('access'), defaultTo('public')),
  aka: pipe(
    prop('tags'),
    titleFilter('aka'),
    valueProp,
    chain(split(/,\s*/))
  ),
  category: pipe(
    prop('tags'),
    titleFilter('category'),
    valueProp,
    head,
    defaultTo('')
  ),
  deprecated: pipe(prop('deprecated'), defaultTo('')),
  description: pipe(
    prop('description'),
    defaultTo(''),
    markdownToHtml
  ),
  example: pipe(
    prop('examples'),
    defaultTo(''),
    prettifyCode
  ),
  name: pipe(prop('name'), defaultTo('')),
  params: pipe(
    prop('params'),
    defaultTo([]),
    map(applySpec({
      description: pipe(
        prop('description'),
        defaultTo(''),
        markdownToHtml
      ),
      name: pipe(prop('name'), defaultTo('')),
      type: pipe(path(['type', 'names', 0]), defaultTo(''))
    }))
  ),
  returns: {
    description: pipe(path(['returns', 0, 'description']), defaultTo('')),
    type: pipe(path(['returns', 0, 'type', 'names', 0]), defaultTo(''))
  },
  see: pipe(
    prop('see'),
    defaultTo(''),
    simplifySee
  ),
  sigs: pipe(
    prop('tags'),
    titleFilter('sig'),
    valueProp,
    map(prettifySig)
  ),
  since: pipe(prop('since'), defaultTo('')),
  typedefns: pipe(
    prop('tags'),
    titleFilter('typedefn'),
    valueProp,
    map(prettifySig)
  )
})

exports.publish = (data, opts) => {
  const packageJsonPath = Path.join(Path.dirname(Path.resolve(opts.configure)),'package.json')
  const packageJSON =  require(packageJsonPath)
  const {version, name, homepage} = packageJSON


  const templateFile = Path.resolve('./index.pug')

  // copy static assets
  copyDir(Path.resolve('./images'), Path.resolve(opts.destination, 'images'))
  copyDir(Path.resolve('./js'), Path.resolve(opts.destination, 'js'))
  copyDir(Path.resolve('./node_modules/ramda/dist'), Path.resolve(opts.destination, 'js'))
  copyDir(Path.resolve('./css'), Path.resolve(opts.destination, 'css'))

  // noinspection JSValidateTypes
  const docs = helper.prune(data)()
    .order('name, version, since')
    .filter({kind: ['function', 'constant', 'class']})
    .get()
    .filter(x => opts.private || (x.access !== 'private'))
    .map(simplifyData)

  const context = {
    docs,
    name,
    homepage,
    version
  }

  const outputContent = pug.renderFile(templateFile, context)

  const outputFile = Path.resolve(opts.destination, 'index.html')

  fs.writeFileSync(outputFile, outputContent, {encoding: 'utf8'})
}
