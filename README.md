# elv-docdash

This is a [JSDoc](https://jsdoc.app/) template created by customizing the [template](https://github.com/ramda/ramda.github.io) used by [Ramda's API documentation](https://ramdajs.com/docs/#). 

These are the major changes:
 * Added 'Show private' checkbox to filter
 * Changed HTML templating engine from [handlebars](https://handlebarsjs.com/) to [pug](https://pugjs.org/api/getting-started.html)
 * Changed CSS templating engine from [less](https://lesscss.org/) to [sass](https://sass-lang.com/)
 * Updated [bootstrap](https://getbootstrap.com/) to version 5.1.3
 * Enhanced filtering to also show/hide the detailed entries, not just the table of contents rows
 * Removed 'Open in REPL' / 'Run it here' links, as well as some tag sections we did not need (e.g.`aka`)
 * Made name and GitHub links dynamic by retrieving info from package.json

## Install

```bash
$ npm install --save-dev @eluvio/elv-ramdoc
```

## Usage (npm)
In your projects `package.json` file add a new script:

```json
"script": {
  "generate-docs": "jsdoc -c .jsdoc.json"
}
```

In your `.jsdoc.json` file (which should be in the top level of your project, in same directory as `package.json`), set `.opts.template` to `"node_modules/@eluvio/elv-ramdoc"`

## Sample `.jsdoc.json`
(Assumes your `.js` files are in `./src`, you want docs placed in `./docs`, and you want to include private items.)
```json
{
  "tags": {
    "allowUnknownTags": true,
    "dictionaries": ["jsdoc"]
  },
  "source": {
    "include": ["src"],
    "includePattern": ".js$",
    "excludePattern": "(node_modules/|docs)"
  },
  "plugins": [
    "plugins/markdown"
  ],
  "opts": {
    "destination": "./docs/",
    "encoding": "utf8",
    "pedantic": true,
    "private": true,
    "recurse": true,
    "template": "node_modules/@eluvio/elv-ramdoc"
  }
}

```

## License
MIT
