const _ELV_RAMDOC_DEBUG = process.env.ELV_RAMDOC_DEBUG

const fs = require('fs')
const fsExtra = require('fs-extra')
const Path = require('path') // can't use lower-case 'path' because of name collision with ramda

const helper = require('jsdoc/util/templateHelper')
const Highlight = require('highlight.js')
const madge = require('madge')
const marked = require('marked')
const pug = require('pug')

const {
  applySpec,
  ascend,
  chain,
  defaultTo,
  filter,
  head,
  identity,
  join,
  map,
  path,
  pipe,
  prop,
  propEq,
  replace,
  sortBy,
  sortWith,
  split,
  toUpper,
  values
} = require('@eluvio/ramda-fork')


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
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, {recursive: true})
  // copy contents
  fsExtra.copy(
    sourceDir,
    destDir,
    err => {
      if (err) throw Error(err)
    }
  )
}

const _dependencies = async (inputPath, entryPoint) => {
  console.log(`inputPath=${inputPath}`)
  console.log(`entryPoint=${entryPoint}`)
  const result = await madge(
    inputPath,
    {
      excludeRegExp: [new RegExp('^' + _escapeRegExp(entryPoint) + '$')]
    }
  )
  return result.obj()
}

// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
const _escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string

const _isDir = pathString => fs.statSync(pathString).isDirectory();

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

const _exampleSplitMultilineOutput = line => {

  const slashReplacements = {'\\\\': '\\', '\\n': '\n', '\\"': '"'};

  function slashUnescape(contents) {
    return contents.replace(/\\([\\n"])/g, function(replace) {
      return slashReplacements[replace];
    });
  }

  const regex = /^(.+)\/\/(=> +OUTPUT: +`)(.+)` *$/

  const match = line.match(regex)
  if(match){
    const indentText = ' '.repeat(match[1].length) + '//' + ' '.repeat(match[2].length)
    const outputLines = slashUnescape(match[3]).split('\n')

    const line1 = match[1] + '//' + match[2] + outputLines[0]
    return outputLines.map((x, i) => i===0 ? line1 : indentText + x).join('\n') + '`'
  } else {
    return line
  }
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
  split('\n'),
  map(_exampleSplitMultilineOutput),
  join('\n'),
  s => Highlight.highlight(s, {language: 'javascript'}).value
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
 * Filters array of objects based on `title` attribute.
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
 * Returns a function that converts an array of JSDoc data objects to an array of objects tailored for our
 * [pug](https://pugjs.org/api/getting-started.html) template.
 *
 * @function
 * @since v0.0.1
 * @category Array
 * @private
 * @sig String -> ([Object] -> [Object])
 * @param {String} baseDir - base directory of project
 * @returns {Function} Function that accepts and array of objects and returns an array of new objects
 *
 */
const _simplifyData = baseDir => applySpec({                    // REMAP: create a new object by slicing and dicing input object
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
  curried: pipe(                                       // create 'curried' attribute
    prop('tags'),
    _titleFilter('curried'),
    head,
    propEq('text', '')
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
  filePath: x => Path.resolve(                         // create 'filePath' attribute
    '/',
    Path.relative(
      baseDir,
      Path.join(
        path(['meta', 'path'], x),
        path(['meta', 'filename'], x)
      )
    )
  ),
  lineno: path(['meta', 'lineno']),                    // create 'lineno' attribute
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
  ),
  type: path(['type', 'names', 0]),                    // create 'type' attribute (used by @constant)
  value: prop('defaultvalue'),                         // create 'value' attribute (used by @constant)
  original: identity
})

//TODO: add pre-check for needed info in package.json

/**
 * Function called by JSDoc to generate the final documentation files.
 *
 * Empties target directory specified in `opts.destination` then populates with documentation files generated from
 * `data` passed in by JSDoc.
 *
 * @function
 * @since v0.0.1
 * @category File
 * @sig ([Object], Object) -> undefined
 * @param {Object} data - [TaffyDB database](https://taffydb.com) passed in by JSDoc
 * @param {Object} opts - Options info passed in by JSDoc
 * @param {Array} opts._ - List of files/directories to scan
 * @param {String} opts.readme - Text to use for README page
 * @param {String} opts.configure - Path to JSDoc configuration file, e.g. `".jsdoc.json"`
 * @param {String} opts.destination - The path to the output folder for the generated documentation.
 * @param {String} opts.encoding - Assume this encoding when reading all source files. Defaults to `"utf8"`.
 * @param {Boolean} opts.pedantic - Treat errors as fatal errors, and treat warnings as errors.
 * @param {Boolean} opts.private - Include symbols marked with the `@private` tag in the generated documentation.
 * @param {Boolean} opts.recurse - Recurse into subdirectories when scanning for source files and tutorials
 * @param {String} opts.template - The path to the template directory to use for generating output (the directory containing the `publish.js` script and other needed files)
 * @returns {undefined}
 *
 */
exports.publish = (data, opts) => {
  const baseDir = Path.dirname(Path.resolve(opts.configure))
  const packageJsonPath = Path.join(baseDir, 'package.json')
  const packageJSON = require(packageJsonPath)
  if (!path(['repository', 'url'], packageJSON)) throw Error('.repository.url not found in package.json')

  if (!opts.destination.includes('docs')) throw Error('Expected to find "docs" in the destination path. This is a safety check to try to prevent accidental emptying of the wrong directory.')

  // get info needed to generate dependency graphs
  const inputPath =  Path.basename(baseDir) === opts["_"][0] ? baseDir : Path.join(baseDir, opts["_"][0])
  const entryPoint = _isDir(inputPath) ? packageJSON.main : ""
  _dependencies(inputPath, entryPoint).then(
    result => {
      if (_ELV_RAMDOC_DEBUG) {
        console.group('INTERNAL DEPENDENCIES:')
        console.log(`items analyzed for dependencies: ${Object.keys(result).length}`)
        console.log(`internal dependency links: ${values(result).reduce(
          (accumulator, element) => accumulator + element.length,
          0
        )}`)
        console.groupEnd()
        console.log()
      }
      return result
    }
  )

  // delete any previous files
  fsExtra.emptyDirSync(Path.resolve(opts.destination))

  // copy static assets
  _copyDir(Path.resolve(__dirname, 'images'), Path.resolve(opts.destination, 'images'))
  _copyDir(Path.resolve(__dirname, 'js'), Path.resolve(opts.destination, 'js'))
  _copyDir(Path.resolve('./node_modules/@eluvio/ramda-fork/dist'), Path.resolve(opts.destination, 'js'))
  _copyDir(Path.resolve(__dirname, 'css'), Path.resolve(opts.destination, 'css'))

  if (_ELV_RAMDOC_DEBUG) {
    console.group('raw data:')
    console.log(JSON.stringify(data().get(), null, 2))
    console.groupEnd()

    console.group('opts:')
    console.log(JSON.stringify(opts, null, 2))
    console.groupEnd()
  }

  let undocumentedItems = data()
    .get()
    .filter(
      i => i.undocumented
        && i.scope === 'global'
        && i.name === i.meta.code.name
        && ['constant', 'function'].includes(i.kind)
        && i.meta.code.type !== 'CallExpression'
        && i.meta.filename !== entryPoint // assumes that main entry point is just a packaging wrapper, no docs expected
    )
    .map(
      i => Object(
        {
          name: i.name,
          location: Path.join(i.meta.path, i.meta.filename)
            + ':' + i.meta.lineno
            + ':' + i.meta.columnno,
          codetype: i.meta.code.type,
          kind: i.kind
        }
      )
    )

  undocumentedItems = sortWith(
    [
      ascend(prop('location')),
      ascend('name'),
    ],
    undocumentedItems
  )

  const prunedData = helper.prune(data)()
  if (_ELV_RAMDOC_DEBUG) {
    console.log('---------')
    console.log('pruned data:')
    console.log('---------')
    console.log(JSON.stringify(prunedData.get(), null, 2))
    console.log()
  }

  const filteredData = sortBy(x => x && toUpper(`${x.name}`),  prunedData.get())
    .filter(x => ['function', 'constant', 'class'].includes(x.kind))
    .filter(x => opts.private || (x.access !== 'private')) // filter out private items if opts.private is false

  // noinspection JSValidateTypes
  const docs = filteredData.map(_simplifyData(baseDir)) // tailor for our template
  if (_ELV_RAMDOC_DEBUG) {
    console.group('filtered data:')
    console.log(JSON.stringify(filteredData, null, 2))
    console.groupEnd()

    console.group('Filtered and reprocessed docs:')
    console.log(JSON.stringify(docs, null, 2))
    console.groupEnd()
    console.log()

    console.group('packageJSON:')
    console.log(JSON.stringify(packageJSON, null, 2))
    console.groupEnd()
    console.log()
  }
  // Convert url reference in packageJSON.repository.url to remove git+ and .git if needed
  const processGithubUrl = url => url.replace(/^git\+/,'').replace(/\.git$/,'')

  const context = {
    baseDir,
    docs,
    docNames: docs.map(prop('name')),
    opts,
    packageJSON,
    processGithubUrl
  }

  const templateFileIndex = Path.resolve(__dirname, 'pug', 'index.pug')
  const outputContentIndex = pug.renderFile(templateFileIndex, context)
  const outputFileIndex = Path.resolve(opts.destination, 'index.html')
  fs.writeFileSync(outputFileIndex, outputContentIndex, {encoding: 'utf8'})

  const templateFileAPI = Path.resolve(__dirname,'pug', 'api.pug')
  const outputContentAPI = pug.renderFile(templateFileAPI, context)
  const outputFileAPI = Path.resolve(opts.destination, 'api.html')
  fs.writeFileSync(outputFileAPI, outputContentAPI, {encoding: 'utf8'})

  console.group('UNDOCUMENTED ITEMS:')
  undocumentedItems.map(i => console.log(i.name + ' (' + i.kind + ')\n' + i.location + '\n'))
  console.groupEnd()
}
