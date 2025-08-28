import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Schema from 'tinymce/core/api/html/Schema';
import * as TrimNode from 'tinymce/core/dom/TrimNode';

describe('browser.tinymce.core.dom.TrimNodeTest', () => {
  const dom = DOMUtils(document, {});
  const baseSchema = Schema();

  const testTrim = (label: string, inputHtml: string, expectedTrimmedHtml: string) => {
    it(label, () => {
      const elm = document.createElement('div');
      elm.innerHTML = inputHtml;
      TrimNode.trimNode(dom, elm.firstChild as Node, baseSchema);

      const actual = elm.innerHTML;
      assert.equal(actual, expectedTrimmedHtml, 'is correct trimmed html');
    });
  };

  testTrim('Empty span should be removed', '<p><span></span>x</p>', '<p>x</p>');
  testTrim('Non-empty span should not be removed', '<p><span>x</span>&nbsp;</p>', '<p><span>x</span>&nbsp;</p>');
  testTrim('Nbsp between inline elements should not be removed', '<p><span>x</span>&nbsp;<span>x</span></p>', '<p><span>x</span>&nbsp;<span>x</span></p>');
  testTrim('Bookmarks should not be removed 1', '<p><span data-mce-type="bookmark"></span> y</p>', '<p><span data-mce-type="bookmark"></span> y</p>');
  testTrim('Bookmarks should not be removed 2', '<p>a <span>b <span data-mce-type="bookmark"></span> c</span></p>', '<p>a <span>b <span data-mce-type="bookmark"></span> c</span></p>');
  testTrim('Trailing nbsp within inline element should not be removed', '<p><strong><span>x</span>&nbsp;</strong></p>', '<p><strong><span>x</span>&nbsp;</strong></p>');
  testTrim('Anchor should not be removed', '<p><a id="anchor"></a><span>x</span></p>', '<p><a id="anchor"></a><span>x</span></p>');
  testTrim('Bogus BR should not be removed', '<p><br data-mce-bogus="1"></p>', '<p><br data-mce-bogus="1"></p>');
  testTrim('Space between inline elements should not be removed', '<p><strong>x</strong> <em>y</em></p>', '<p><strong>x</strong> <em>y</em></p>');
  testTrim('New line between inline elements should not be removed', '<pre><strong>x</strong>\n<em>y</em></pre>', '<pre><strong>x</strong>\n<em>y</em></pre>');

  it('Fragmented text node', () => {
    const emptyTextNode = document.createTextNode(' ');
    const elm = document.createElement('div');
    elm.innerHTML = '<strong>abc</strong>abc';
    elm.insertBefore(emptyTextNode, elm.lastChild);
    elm.insertBefore(emptyTextNode.cloneNode(), elm.firstChild);

    const actual = TrimNode.trimNode(dom, elm, baseSchema);

    assert.equal(actual.innerHTML, ' <strong>abc</strong> abc', 'Empty text node shouldn\'t be trimmed');
  });

  it('Document node', () => {
    const expected = document.implementation.createHTMLDocument('test');
    const actual = TrimNode.trimNode(dom, expected, baseSchema);

    assert.strictEqual(actual, expected, 'Should return document as is');
  });
});
