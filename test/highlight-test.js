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

  it('should highlight first and last', () => {
    const query = 'highlight';
    const html = `<p>highlight text highlight</p>`
    const result = highlight(query, html);
    assert.deepEqual(result, `<p><mark>highlight</mark> text <mark>highlight</mark></p>`);
  })

  it('should highlight simple middle', () => {
    const query = 'highlight';
    const html = `<p>text highlight text</p>`
    const result = highlight(query, html);
    assert.deepEqual(result, `<p>text <mark>highlight</mark> text</p>`);
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

  it('should highlight nested content that matches "what about bob"', () => {
    const query = 'what about bob';
    const html = `<div>Movie: <p><b>What</b> about Bob?</p></div>`;
    const result = highlight(query, html);
    assert.deepEqual(result, '<div>Movie: <p><b><mark>What</mark></b><mark> about Bob</mark>?</p></div>');
  })

  it('should ignore script', () => {
    const query = 'var';
    const html = `<div><script>var thing = 'testing'</script></div>`;
    const result = highlight(query, html);
    assert.deepEqual(result, `<div><script>var thing = 'testing'</script></div>`);
  })

  it('should handle deeply nested', () => {
    const query = 'abbott';
    const html = `<ul class="reference-index__index-columns"><li><a href="#">Abbott, Hiram</a></li><li><a href="#">Abbott, Lewis</a></li></ul>`
    const result = highlight(query, html);
    assert.deepEqual(result, `<ul class="reference-index__index-columns"><li><a href="#"><mark>Abbott</mark>, Hiram</a></li><li><a href="#"><mark>Abbott</mark>, Lewis</a></li></ul>`);
  })

  it.skip('should handle &nbsp;', () => {
    const query = 'broke it';
    const html = `<p>I broke <span>&nbsp;</span>it for</p>`;
    const result = highlight(query, html);
    assert.deepEqual(result, `<p>I <mark>broke</mark> <span>&nbsp;</span><mark>it</mark> for</p>`);
  })

});