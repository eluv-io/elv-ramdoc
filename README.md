# elv-ramdoc

This is a [JSDoc](https://jsdoc.app/) template created by customizing the [template](https://github.com/ramda/ramda.github.io) used by [Ramda's API documentation](https://ramdajs.com/docs/#). 

These are the major changes:
 * Added 'Show private' checkbox to filter
 * Changed HTML templating engine from [handlebars](https://handlebarsjs.com/) to [pug](https://pugjs.org/api/getting-started.html)
 * Changed CSS templating engine from [less](https://lesscss.org/) to [sass](https://sass-lang.com/)
 * Updated [bootstrap](https://getbootstrap.com/) to version 5.1.3
 * Enhanced filtering to also show/hide the detailed entries, not just the table of contents rows
 * Removed 'Open in REPL' / 'Run it here' links, as well as some tag sections we did not need (e.g.`aka`)
 * Made project name and GitHub links dynamic by retrieving info from package.json
 * Added Eluvio logo (linking to https://eluv.io) and favicon 

## Install

```bash
$ npm install --save-dev @eluvio/elv-ramdoc
```
## Prerequisites and conventions

The following are assumed by this template and this README:

 * Your code is hosted on [GitHub](https://github.com/)
 * Your project's repo has version tags (e.g.`v0.0.1`)
 * Your project's documentation is in top level directory `docs`
 * Your project has [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages) enabled
   * Make sure your account or organization has GitHub Pages enabled
   * Configure GitHub Pages for your project
     * Go to your project's Settings → Pages screen
     * Under Source, pick the branch and the folder (`/docs`)
 * You have the following files at the top level of your repo:
   * `README.md`
   * `.jsdoc.json` (see below for sample)
   * `package.json` with the following attributes:
     * `name`
     * `version`
     * `homepage` set to the URL of your project's GitHub pages root
     * `repository.url` set to the URL of your project's GitHub repo
   

NOTE: You should put a link to the API documentation in your README.md file that connects to GitHub pages, e.g.:
```markdown
## API Documentation

[https://eluv-io.github.io/elv-ramdoc/api.html](https://eluv-io.github.io/elv-ramdoc/api.html)
```

### Example `package.json` fragment
Note that `homepage` is set to project GitHub Pages root, while `repository.url` points to the GitHub project page.
```json
{
  "name": "@eluvio/elv-ramdoc",
  "version": "0.0.2",
  "homepage": "https://eluv-io.github.io/elv-ramdoc",
  "repository": {
    "type": "git",
    "url": "https://github.com/eluv-io/elv-ramdoc"
  }
}
```

### Example `.jsdoc.json` file
Assumes the following:
 * Your `.js` files are in `src/`
 * Your documentation files are in `docs/`
 * You want to include items that have `@private` specified
```json
{
  "tags": {
    "allowUnknownTags": ["category","curried","sig"],
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

In order for the GitHub source code links to work properly, you should rebuild and commit the docs with the npm 
`version` lifecycle hook, so that the docs will be rebuilt immediately after version number is bumped in `package.json`:
```json
"script": {
  "version": "npm run generate-docs && git add docs && git commit -m 'Update docs'"
}
```
## API Documentation

[https://eluv-io.github.io/elv-ramdoc/](https://eluv-io.github.io/elv-ramdoc/)

## License
MIT
