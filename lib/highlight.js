'use strict';

const htmlparser = require('htmlparser2'),
  render = require('dom-serializer'),
  domUtils = require('domutils'),
  traverse = require('./traverse'),
  Match = require('./match');

/**
 * Pre-order traversal that retrieves the text content 
 * @param {DOM Array} dom - see: https://github.com/fb55/htmlparser2
 * @returns {String} Text content of dom
 */
const getText = (dom) => {
  let text = '';
  traverse(dom, ({type, data, parent}) => {
    parent = parent || {};
    if (type !== 'script' && parent.type !== 'script' && data) {
      text += data;
    }
  });
  return text;
};

// http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function escape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Finds all matches of query in text 
 * @param {String} query - search term
 * @param {String} text - text content to search
 * @returns {Array} Array of match objects: text and start, end values
 */
const findMatches = (query, text) => {
  const matches = [];
  const escapedQuery = escape(query);
  const regex = new RegExp(escapedQuery, 'ig');
  let found;
  while ((found = regex.exec(text)) !== null) {
    const match = new Match({
      text: found.input.substring(found.index, regex.lastIndex),
      start: { index: found.index },
      end: { index: regex.lastIndex }
    });
    matches.push(match);
  }
  return matches;
};

const isCurrentNode = (type, length, index) => {
  return type === 'start' ? (length > index) : (length >= index);
};
/**
 * Attaches corresponding node to each matched index 
 */
const determineNodes = (matches, dom) => {
  let text = '';
  let i = 0;
  traverse(dom, (node) => {
    const parent = node.parent || {};
    let match = matches[i];
    if (node.type === 'script' || parent.type === 'script' || !node.data || !match) {
      return;
    }
    let checkNextNode = false;
    let nodeStart = text.length;
    text += node.data;
    let nodeEnd = text.length;
    while (match && !checkNextNode) {
      let prevMatch = matches[i - 1] || { end: { index: nodeStart } };
      let nextMatch = matches[i + 1] || { start: { index: nodeEnd } };
      match.keys.forEach(key => {
        if (!match[key].node && isCurrentNode(key, text.length, match[key].index)) {
          match[key].node = node;
          let index = match[key].index - nodeStart;
          let adjustedStartIndex = prevMatch.end.index - nodeStart;
          adjustedStartIndex = adjustedStartIndex > 0 ? adjustedStartIndex : 0;
          match[key].data = {
            prev: node.data.substring(adjustedStartIndex, index),
            next: node.data.substring(index, nextMatch.start.index - nodeStart)
          };
        }
      });

      if (match.start.node && match.end.node) {
        let node = match.end.node.prev;
        while (node && node !== match.start.node) {
          match.intermediate = match.intermediate || [];
          match.intermediate.unshift(node);
          node = node.prev;
        }
        i++;
        match = matches[i];
      } else {
        checkNextNode = true;
      }
    }
  });
};

/**
 * highlight.js
 * 
 * @param {String} query - text to highlight in html content
 * @param {String} html - HTML content.
 * @param {Object} [options] - Parser and serializer options
 */
const highlight = (query, html, {parser = {}, serializer = {}} = {}) => {
  if(!query) {
    return html;
  }
  const dom = htmlparser.parseDOM(html, parser);
  let text = getText(dom);
  const matches = findMatches(query, text);
  if(!matches.length) {
    return html;
  }
  determineNodes(matches, dom);
  matches.forEach((match) => {
    if (match.start.node === match.end.node) {
      let parent = match.start.node.parent || null;
      const mark = match.mark;
      mark.children.forEach( child => {child.parent = mark;});
      const container = parent ? parent.children : dom;
      //if 1st match
      domUtils.replaceElement(match.start.node, match.prev);
      container.push(mark);
      container.push(match.next);
    } else {
      match.keys.forEach(key => {
        const parent = match[key].node.parent || null;
        const container = parent ? parent.children : dom;
        let index = container.findIndex( (node) => (node === match[key].node));
        key === 'start' && container.splice(index + 1, 0, match.prev, match.markStart);
        key === 'end' && container.splice(index, 0, match.markEnd, match.next);
        domUtils.removeElement(match[key].node);
      });
      
      traverse(match.intermediate, (node) => {
        if (node.type === 'text' && node.data) {
          let mark = {
            type: 'tag',
            name: 'mark',
            attribs: {},
            children: [node],
            next: match.end.node,
            prev: null,
            parent: node.parent
          };
          domUtils.replaceElement(node, mark);
        }
      });
    }
  });

  return render(dom, serializer);
};

module.exports = highlight;