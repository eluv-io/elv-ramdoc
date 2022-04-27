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
## Prerequisites and conventions

The following are assumed by this template and this README:

 * Your code is hosted on [GitHub](https://github.com/)
 * Your project's documentation is to be built in top level directory `docs`
 * Your project has [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages) enabled
   * Make sure your account or organization has GitHub Pages enabled
   * Configure GitHub Pages for your project
     * Go to your project's Settings → Pages screen
     * Under Source, pick the branch and the folder (`/docs`)
 * Your code is organized in a similar fashion to [Ramda](https://github.com/ramda/ramda), with one function per file.
 * You have the following files at the top level of your repo:
   * `README.md`
   * `package.json` with the following attributes:
     * `name`
     * `version`
     * `homepage` set to the URL of your project's GitHub pages root
     * `repository.url` set to the URL of your project's GitHub repo
   * `.jsdoc.json` (see below for sample)

### Example `package.json` fragment
```json
{
  "name": "@eluvio/elv-ramdoc",
  "version": "0.0.2",
  "repository": {
    "type": "git",
    "url": "https://github.com/eluv-io/elv-ramdoc"
  },
  "homepage": "https://github.com/eluv-io/elv-ramdoc"
}
```

### Example `.jsdoc.json` file
Assumes the following:
 * Your `.js` files are in `src/`
 * Your documentation files are to go in `docs/`
 * You want to include items that have `@private` specified
```json
{
  "tags": {
    "allowUnknownTags": ["category","sig"],
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

## Usage (node.js)

In your projects `package.json` file add a new script:

```json
"script": {
  "generate-docs": "jsdoc --readme README.md --configure .jsdoc.json"
}
```

Running this task with `npm run generate-docs` will generate your documentation.

If you would like to print the data being processed, set environment variable `ELV_RAMDOC_DEBUG`:

```json
"script": {
  "generate-docs-debug": "export ELV_RAMDOC_DEBUG=1; jsdoc --readme README.md --configure .jsdoc.json"
}
```

## License
MIT
