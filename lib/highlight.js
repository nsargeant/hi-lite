'use strict';

const htmlparser = require('htmlparser2'),
  render = require('dom-serializer'),
  domUtils = require('domutils'),
  traverse = require('./traverse');

/**
 * Pre-order traversal that retrieves the text content 
 * @param {DOM Array} dom - see: https://github.com/fb55/htmlparser2
 * @returns {String} Text content of dom
 */
const getText = (dom) => {
  let text = '';
  traverse(dom, (node) => {
    if (node.type !== 'script' && node.data) {
      text += node.data;
    }
  });
  return text;
};

/**
 * Finds all matches of query in text 
 * @param {String} query - search term
 * @param {String} text - text content to search
 * @returns {Array} Array of match objects: text and start, end values
 */
const findMatches = (query, text) => {
  const matches = [];
  //TODO escape regex
  const regex = new RegExp(query, 'ig');
  let found;
  while ((found = regex.exec(text)) !== null) {
    matches.push({
      text: found.input.substring(found.index, regex.lastIndex),
      start: {
        index: found.index
      },
      end: {
        index: regex.lastIndex
      }
    });
  }
  return matches;
};

/**
 * Attaches corresponding node to each matched index 
 */
const determineNodes = (matches, dom) => {
  let text = '';
  // let i = 0;
  const container = [... matches];
  let match = container.shift();
  if (matches.length) {
    traverse(dom, (node) => {
      if(!match) {
        return;
      }
      if (node.type !== 'script' && node.data) {
        text += node.data;
        ['start', 'end'].forEach(key => {
          if (!match[key].node && text.length >= match[key].index) {
            match[key].node = node;
            let index = match[key].index - text.lastIndexOf(node.data);
            match[key].data = {
              prev: node.data.substring(0, index),
              next: node.data.substring(index)
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
          match = container.shift();
        }
      }
    });
  }
}

/**
 * highlight.js
 * 
 * @param {String} query - text to highlight in html content
 * @param {String} html - HTML content.
 * @param {Object} [options] - Parser and serializer options
 */
module.exports = (query, html, {parser = {}, serializer = {}} = {}) => {
  const dom = htmlparser.parseDOM(html, parser);
  let text = getText(dom);
  const matches = findMatches(query, text);
  determineNodes(matches, dom);
  matches.forEach(match => {
    if (match.start.node === match.end.node) {
      let parent = match.start.node.parent || null;
      const mark = {
        type: 'tag',
        name: 'mark',
        attribs: {},
        children: [{
          data: match.text,
          type: 'text',
          next: null,
          prev: null,
          parent: null
        }],
        next: null,
        prev: match.start.node,
        parent
      };
      mark.children.forEach( child => {child.parent = mark;});
      match.start.node.data = match.start.data.prev;
      match.start.node.next = mark;
      if (parent) {
        parent.children.push(mark);
      } else {
        dom.push(mark)
      }
    } else {
      ['start', 'end'].forEach(key => {
        let parent = match[key].node.parent || null;
        match[key].node.data = (key === 'start') ? match[key].data.prev : match[key].data.next;
        let mark = (key === 'start') ? {
          type: 'tag',
          name: 'mark',
          attribs: {},
          children: [{
            data: match.start.data.next,
            type: 'text',
            next: null,
            prev: null,
            parent: null
          }],
          next: null,
          prev: match.start.node,
          parent
        } : {
          type: 'tag',
          name: 'mark',
          attribs: {},
          children: [{
            data: match.end.data.prev,
            type: 'text',
            next: null,
            prev: null,
            parent: null
          }],
          next: match.end.node,
          prev: null,
          parent
        };

        const container = parent ? parent.children : dom;
        let index = container.findIndex( (node) => (node === match[key].node));
        if (key === 'start') {
          mark.next = match.start.node.next;
          match.start.node.next = mark;
          container.splice(index + 1, 0, mark);
        } else {
          mark.prev = match.end.node.prev;
          match.end.node.prev = mark;
          container.splice(index, 0, mark);
        }
      });
      
      traverse(match.intermediate, (node) => {
        let parent = node.parent;
        if (node.type === 'text' && node.data) {
          let mark = {
            type: 'tag',
            name: 'mark',
            attribs: {},
            children: [node],
            next: match.end.node,
            prev: null,
            parent
          };
          domUtils.replaceElement(node, mark);
        }
      });
    }
  });

  return render(dom, serializer);
};