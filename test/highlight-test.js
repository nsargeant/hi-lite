'use strict';

const assert = require('assert'),
  highlight = require('../lib/highlight');

describe('highlight', () => {
  it('should be defined', () => {
    assert(highlight);
    assert.deepEqual(typeof highlight, 'function');
  })

  it('should highlight simple', () => {
    const query = 'test';
    const html = `<p>this is a test</p>`;
    const result = highlight(query, html);
    assert.deepEqual(result, '<p>this is a <mark>test</mark></p>');
  })

  it('should highlight "a lot of tests"', () => {
    const query = 'a lot of tests';
    const html = `<p>there are a <em>lot</em> of tests man</p>`;
    const result = highlight(query, html);
    assert.deepEqual(result, '<p>there are <mark>a </mark><em><mark>lot</mark></em><mark> of tests</mark> man</p>');
  })

  it('should highlight "a test"', () => {
    const query = 'a test';
    const html = `<p>this is a <b>test suite</b></p>`;
    const result = highlight(query, html);
    assert.deepEqual(result, '<p>this is <mark>a </mark><b><mark>test</mark> suite</b></p>');
  })

  it('should highlight multiple matches of "a test"', () => {
    const query = 'a test';
    const html = `<p>this is a <b>test suite</b></p><p>this is a <b>test suite</b></p>`;
    const result = highlight(query, html);
    assert.deepEqual(result, '<p>this is <mark>a </mark><b><mark>test</mark> suite</b></p><p>this is <mark>a </mark><b><mark>test</mark> suite</b></p>');
  })
});