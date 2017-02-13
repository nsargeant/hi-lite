# hi-lite
Server-side html highlighting

## Getting Started
`npm i hi-lite`

### Example
```javascript
const highlight = require('hi-lite'),
  query = 'test',
  html = `<p>this is a test</p>`;

highlight(query, html);
//RETURNS
// <p>this is a <mark>test</mark></p>
```

## API

### highlight(query, html, [options])
 * query: {String} - text to highlight in html content
 * html: {String} - HTML content.
 * [options]: {Object} - Parser and serializer options
  * parser: {Object} - see [htmlparser2 options](https://github.com/fb55/htmlparser2/wiki/Parser-options)
  * serializer: {Object} - see [dom-serializer](https://github.com/cheeriojs/dom-serializer)