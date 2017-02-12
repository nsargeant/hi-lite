'use strict';

/**
 * @function traverse
 * @param {DOM Array} dom - see: https://github.com/fb55/htmlparser2
 * @param {requestCallback} cb - The function to execute for each node
 * @description pre-order depth first search traversal
 */
const traverse = (nodes = [], cb) => {
  if(!nodes.length) {
    return;
  }
  nodes.forEach( node => {
    cb(node);
    traverse(node.children, cb);
  });
};

module.exports = traverse;