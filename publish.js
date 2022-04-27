const DEBUG_MODE=false

const fs = require('fs-extra')
const Path = require('path') // can't use lower-case 'path' because of name collision with ramda

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


const helper = require('jsdoc/util/templateHelper')
const hljs = require('highlight.js')
const marked = require('marked')
const pug = require('pug')

/**
 * Copies a directory's contents recursively, creating the destination directory if needed
 *
 * @function
 * @since v0.0.1
 * @category File
 * @private
 * @sig (String, String) -> undefined
 * @param {String} sourceDir - Directory from which to copy contents
 * @param {String} destDir - Directory to copy to
 * @returns {undefined}
 *
 * @example
 *
 * _copyDir(
 *   '/Users/foo/elv-ramdoc/node_modules/ramda/dist',
 *   '/Users/foo/elv-ramdoc/docs/js',
 * ) //=> undefined
 *
 */
const _copyDir = (sourceDir, destDir) => {
  // create dir if it doesn't exist
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })
  // copy contents
  fs.copy(
    sourceDir,
    destDir,
    err => {if (err) throw Error(err)}
  )
}

/**
 * Converts text in [Markdown](https://www.markdownguide.org/) format to an HTML string
 *
 * @function
 * @since v0.0.1
 * @category String
 * @private
 * @sig String -> String
 * @param {String} mdString - text in Markdown format
 * @returns {String} HTML text
 *
 * @example
 *
 * _markdownToHtml('#foo') //=> '<h1 id="foo">foo</h1>'
 *
 */
const _markdownToHtml = function (mdString) {
  return marked.parse(mdString)
}

/**
 * Formats example Javascript code using [highlight.js](https://highlightjs.org/) syntax highlighting
 *
 * @function
 * @since v0.0.1
 * @category String
 * @private
 * @sig String | [String] -> String
 * @param {(String | String[])} - string or array of strings containing lines of code
 * @returns {String} HTML text
 *
 * @example
 *
 * _prettifyCode('console.log(x)') //=> '<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(x)'
 *
 */
const _prettifyCode = pipe(
  join('\n'),
  s => hljs.highlight(s, {language: 'javascript'}).value
)

/**
 * Replaces '...' with '…' and '->' with '→'.
 * Used for processing @sig tags
 *
 * @function
 * @since v0.0.1
 * @category String
 * @private
 * @sig String -> String
 * @param {String} - input string (@sig tag contents)
 * @returns {String} String with symbols substituted in
 *
 * @example
 *
 * _prettifySig('a -> b') //=> 'a → b'
 *
 */
const _prettifySig = pipe(
  replace(/[.][.][.]/g, '\u2026'),
  replace(/->/g, '\u2192')
)

/**
 * Splits each string in an array by comma (excising whitespace in the process), keeping the array flat.
 * Used to simplify handling of @see tag listing multiple items, where items might be listed on same line
 * (separated by commas) on multiple lines.
 *
 * @function
 * @since v0.0.1
 * @category Array
 * @private
 * @sig [String] -> [String]
 * @param {String[]} - @see tag contents as string array
 * @returns {String[]} String array with each item in a separate element, regardless of whether it was on a new line or
 * was on same line as another item but separated by a comma
 *
 * @example
 *
 * _simplifySee(
 *   [
 *     'foo, bar',
 *     'baz'
 *   ]
 * ) //=> [ 'foo', 'bar', 'baz' ]
 *
 */
const _simplifySee = chain(split(/\s*,\s*/))

/**
 * Splits each string in an array by comma (excising whitespace in the process), keeping the array flat.
 * Used to simplify handling of @see tag listing multiple items, where items might be listed on same line
 * (separated by commas) on multiple lines.
 *
 * @function
 * @since v0.0.1
 * @category Array
 * @private
 * @sig String -> [Object] -> [Object]
 * @param {String} - The string to filter by
 * @param {Object[]} - Array of objects to filter by 'title' attribute
 * @returns {Object[]} The filtered object array
 *
 * @example
 *
 * _titleFilter('see')(
 *   [
 *     {title: 'since'},
 *     {title: 'see'}
 *   ]
 * ) //=> [{title: 'see'}]
 *
 */
const _titleFilter = pipe(propEq('title'), filter)

/**
 * Extracts 'value' property from an array of objects, flattening one level if 'value' is an array
 *
 * @function
 * @since v0.0.1
 * @category Array
 * @private
 * @sig [Object] -> [*]
 * @param {Object[]} - Array of objects
 * @returns {Array} Extracted `value` property from each object
 *
 * @example
 *
 * _valueProp(
 *   [
 *     {value: 'a'},
 *     {value: ['b', 'c']}
 *   ]
 * ) //=> ['a', 'b', 'c']
 *
 */
const _valueProp = chain(prop('value'))

/**
 * Converts an array of JSDoc data objects to an array of objects tailored for our
 * [pug](https://pugjs.org/api/getting-started.html) template.
 *
 * @function
 * @since v0.0.1
 * @category Array
 * @private
 * @sig [Object] -> [Object]
 * @param {Object[]} - Array (or iterable) of objects from JSDoc
 * @returns {Object[]} Array of objects tailored for our pug template
 *
 */
const _simplifyData = applySpec({                    // REMAP: create a new object by slicing and dicing input object
  access: pipe(                                        // create 'access' attribute containing 'public' or 'private'
    prop('access'),
    defaultTo('public')
  ),
  category: pipe(                                      // create 'category' attribute
    prop('tags'),
    _titleFilter('category'),
    _valueProp,
    head,
    defaultTo('')
  ),
  deprecated: pipe(                                    // create 'deprecated' attribute
    prop('deprecated'),
    defaultTo('')
  ),
  description: pipe(                                   // create 'description' attribute
    prop('description'),
    defaultTo(''),
    _markdownToHtml
  ),
  example: pipe(                                       // create 'example' attribute
    prop('examples'),
    defaultTo(['']),
    _prettifyCode
  ),
  name: pipe(                                          // create 'name' attribute
    prop('name'),
    defaultTo('')
  ),
  params: pipe(                                        // create 'params' attribute
    prop('params'),
    defaultTo([]),
    map(applySpec({
      description: pipe(
        prop('description'),
        defaultTo(''),
        _markdownToHtml
      ),
      name: pipe(
        prop('name'),
        defaultTo('')
      ),
      type: pipe(
        path(['type', 'names', 0]),
        defaultTo('')
      )
    }))
  ),
  returns: {                                           // create 'returns' attribute
    description: pipe(
      path(['returns', 0, 'description']),
      defaultTo('')
    ),
    type: pipe(
      path(['returns', 0, 'type', 'names', 0]),
      defaultTo('')
    )
  },
  see: pipe(                                           // create 'see' attribute
    prop('see'),
    defaultTo(''),
    _simplifySee
  ),
  sigs: pipe(
    prop('tags'),                                      // create 'sigs' attribute
    _titleFilter('sig'),
    _valueProp,
    map(_prettifySig)
  ),
  since: pipe(                                         // create 'since' attribute
    prop('since'),
    defaultTo('')
  )
})

/**
 * Empties target directory specified in `opts.destination` then populates with documentation files generated from `data`
 *
 * @function
 * @since v0.0.1
 * @category File
 * @sig ([Object], Object) -> undefined
 * @param {Object[]} data - Array (or iterable) of objects passed in by JSDoc
 * @param {Object} opts - Options info passed in by JSDoc
 * @returns {undefined}
 *
 */
exports.publish = (data, opts) => {
  if(!opts.destination.includes('docs')) throw Error('Expected to find "docs" in the destination path. This is a safety check to try to prevent accidental emptying of the wrong directory.')

  // delete any previous files
  fs.emptyDirSync(Path.resolve(opts.destination))

  if(DEBUG_MODE) {
    const dataAsArray = data().get()
    console.log('---------')
    console.log('raw data:')
    console.log('---------')
    console.log(JSON.stringify(dataAsArray,null,2))
    console.log()
    console.log('---------')
    console.log('opts:')
    console.log('---------')
    console.log(JSON.stringify(opts,null,2))
  }

  const packageJsonPath = Path.join(Path.dirname(Path.resolve(opts.configure)),'package.json')
  const packageJSON =  require(packageJsonPath)

  const templateFile = Path.resolve(__dirname, 'index.pug')

  // noinspection JSValidateTypes
  const docs = helper.prune(data)()
    .order('name, version, since')
    .filter({kind: ['function', 'constant', 'class']})
    .get()
    .filter(x => opts.private || (x.access !== 'private'))
    .map(_simplifyData)

  if(DEBUG_MODE) {
    console.log('---------')
    console.log('filtered and reprocessed docs:')
    console.log('---------')
    console.log(JSON.stringify(docs,null,2))
    console.log()
    console.log('---------')
    console.log('packageJSON:')
    console.log('---------')
    console.log(JSON.stringify(packageJSON,null,2))
    console.log()
  }

  const context = {
    docs,
    opts,
    packageJSON
  }

  const outputContent = pug.renderFile(templateFile, context)

  const outputFile = Path.resolve(opts.destination, 'index.html')

  fs.writeFileSync(outputFile, outputContent, {encoding: 'utf8'})

  // copy static assets
  _copyDir(Path.resolve(__dirname, 'images'), Path.resolve(opts.destination, 'images'))
  _copyDir(Path.resolve(__dirname, 'js'), Path.resolve(opts.destination, 'js'))
  _copyDir(Path.resolve('./node_modules/ramda/dist'), Path.resolve(opts.destination, 'js'))
  _copyDir(Path.resolve(__dirname, 'css'), Path.resolve(opts.destination, 'css'))

}
