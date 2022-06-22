import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import * as NormalizeRange from 'tinymce/core/selection/NormalizeRange';
import * as Zwsp from 'tinymce/core/text/Zwsp';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.selection.NormalizeRangeTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const assertRange = (root: Node, range: Optional<Range>, startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
    const sc = Hierarchy.follow(SugarElement.fromDom(root), startPath).getOrDie();
    const ec = Hierarchy.follow(SugarElement.fromDom(root), endPath).getOrDie();
    const actualRange = range.getOrDie('Should be some');

    Assertions.assertDomEq('Should be expected start container', sc, SugarElement.fromDom(actualRange.startContainer));
    assert.equal(actualRange.startOffset, startOffset, 'Should be expected start offset');
    Assertions.assertDomEq('Should be expected end container', ec, SugarElement.fromDom(actualRange.endContainer));
    assert.equal(actualRange.endOffset, endOffset, 'Should be expected end offset');
  };

  const setHtml = viewBlock.update;

  const normalizeRange = (startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
    const sc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie();
    const ec = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), endPath).getOrDie();
    const rng = document.createRange();

    rng.setStart(sc.dom, startOffset);
    rng.setEnd(ec.dom, endOffset);

    return NormalizeRange.normalize(DOMUtils(document, { root_element: viewBlock.get() }), rng);
  };

  const assertRangeNone = (range: Optional<Range>) => {
    assert.isTrue(range.isNone(), 'Should be none');
  };

  context('Non normalize non collapsed selections', () => {
    it('Should not normalize on indexed selected at root level', () => {
      setHtml('<input>');
      const range = normalizeRange([], 0, [], 1);
      assertRangeNone(range);
    });

    it('Should not normalize if selection is around a caret container', () => {
      setHtml('<p data-mce-caret="before">b</p>');
      const range = normalizeRange([], 0, [], 1);
      assertRangeNone(range);
    });

    it('Should not normalize if selection ends after table', () => {
      setHtml('<p>a</p><table><tr><td>b</td></tr></table>');
      const range = normalizeRange([ 0, 0 ], 0, [], 2);
      assertRangeNone(range);
    });

    it('Should not normalize into pre', () => {
      setHtml('<pre>a</pre>');
      const range = normalizeRange([], 0, [], 1);
      assertRangeNone(range);
    });

    it('Should not normalize into code', () => {
      setHtml('<code>a</code>');
      const range = normalizeRange([], 0, [], 1);
      assertRangeNone(range);
    });

    it('Should not normalize to before/after table', () => {
      setHtml('<table><tr><td>a</td></tr></table>');
      const range = normalizeRange([], 0, [], 1);
      assertRangeNone(range);
    });
  });

  context('Non normalize caret positions', () => {
    it('Should not normalize on a caret at start of text node', () => {
      setHtml('<p>a</p>');
      const range = normalizeRange([ 0, 0 ], 0, [ 0, 0 ], 0);
      assertRangeNone(range);
    });

    it('Should not normalize on a caret at middle of text node', () => {
      setHtml('<p>a</p>');
      const range = normalizeRange([ 0, 0 ], 1, [ 0, 0 ], 1);
      assertRangeNone(range);
    });

    it('Should not normalize on a caret at end of text node', () => {
      setHtml('<p>a</p>');
      const range = normalizeRange([ 0, 0 ], 1, [ 0, 0 ], 1);
      assertRangeNone(range);
    });

    it('Should not normalize on a caret before input', () => {
      setHtml('<p><input></p>');
      const range = normalizeRange([ 0 ], 0, [ 0 ], 0);
      assertRangeNone(range);
    });

    it('Should not normalize on a caret between inputs', () => {
      setHtml('<p><input><input></p>');
      const range = normalizeRange([ 0 ], 1, [ 0 ], 1);
      assertRangeNone(range);
    });

    it('Should not normalize on a caret after input', () => {
      setHtml('<p><input></p>');
      const range = normalizeRange([ 0 ], 1, [ 0 ], 1);
      assertRangeNone(range);
    });

    it('Should not normalize on a caret after image', () => {
      setHtml('<p><img src="about: blank"></p>');
      const range = normalizeRange([ 0 ], 1, [ 0 ], 1);
      assertRangeNone(range);
    });

    it('Should not normalize on a caret before image', () => {
      setHtml('<p><img src="about: blank"></p>');
      const range = normalizeRange([ 0 ], 0, [ 0 ], 0);
      assertRangeNone(range);
    });

    it('Should not normalize before br', () => {
      setHtml('<p><br></p>');
      const range = normalizeRange([ 0 ], 0, [ 0 ], 0);
      assertRangeNone(range);
    });

    it('Should not normalize into previous block with format', () => {
      setHtml('<div><p><b>a</b></p>b</p>');
      const range = normalizeRange([ 0, 1 ], 0, [ 0, 1 ], 0);
      assertRangeNone(range);
    });

    it('Should not normalize into previous format inline with input', () => {
      setHtml('<p><b><input></b>b</p>');
      const range = normalizeRange([ 0, 1 ], 0, [ 0, 1 ], 0);
      assertRangeNone(range);
    });

    it('Should not normalize into previous cef inline', () => {
      setHtml('<p><b contenteditable="false">a</b>b</p>');
      const range = normalizeRange([ 0, 1 ], 0, [ 0, 1 ], 0);
      assertRangeNone(range);
    });

    it('Should not normalize into cef block', () => {
      setHtml('<p contenteditable="false">a</p>');
      const range = normalizeRange([], 0, [], 0);
      assertRangeNone(range);
    });

    it('Should not normalize into previous anchor inline', () => {
      setHtml('<p><a href="#">a</a>b</p>');
      const range = normalizeRange([ 0, 1 ], 0, [ 0, 1 ], 0);
      assertRangeNone(range);
    });

    it('Should not normalize out of a span caret container', () => {
      setHtml('<p><b>a</b><span data-mce-caret="before">b</span></p>');
      const range = normalizeRange([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0);
      assertRangeNone(range);
    });

    it('Should not normalize out of a zwsp caret container', () => {
      setHtml('<p><b>a</b>' + Zwsp.ZWSP + '</p>');
      const range = normalizeRange([ 0, 1 ], 0, [ 0, 1 ], 0);
      assertRangeNone(range);
    });

    it('Should not normalize when caret is at start of text node', () => {
      setHtml('a');
      const range = normalizeRange([ 0 ], 0, [ 0 ], 0);
      assertRangeNone(range);
    });

    it('Should not normalize when caret is at end of text node', () => {
      setHtml('a');
      const range = normalizeRange([ 0 ], 1, [ 0 ], 1);
      assertRangeNone(range);
    });

    it('Should not normalize when caret is at middle of text node', () => {
      setHtml('ab');
      const range = normalizeRange([ 0 ], 1, [ 0 ], 1);
      assertRangeNone(range);
    });

    it('Should not normalize when caret is before text node', () => {
      setHtml('a');
      const range = normalizeRange([], 0, [], 0);
      assertRangeNone(range);
    });

    it('Should not normalize when caret is after text node', () => {
      setHtml('a');
      const range = normalizeRange([], 1, [], 1);
      assertRangeNone(range);
    });

    it('Should not normalize into inline elements if target inline pos is a br', () => {
      setHtml('<p><i><b><br /></b></i><br /></p>');
      const range = normalizeRange([ 0 ], 1, [ 0 ], 1);
      assertRangeNone(range);
    });

    it('Should not normalize from after double br', () => {
      setHtml('<p>a<br /><br /></p>');
      const range = normalizeRange([ 0 ], 3, [ 0 ], 3);
      assertRangeNone(range);
    });

    it('Should not normalize into first text node', () => {
      setHtml('a<b>b</b>c');
      const range = normalizeRange([], 0, [], 0);
      assertRangeNone(range);
    });

    it('Should not normalize into last text node', () => {
      setHtml('a<b>b</b>c');
      const range = normalizeRange([], 3, [], 3);
      assertRangeNone(range);
    });

    it('TINY-7817: Should not normalize caret into previous inline element if it is a comment', () => {
      setHtml('<p><!-- a comment -->b</p>');
      const range = normalizeRange([ 0, 1 ], 0, [ 0, 1 ], 0);
      assertRangeNone(range);
    });
  });

  context('Normalize caret positions', () => {
    it('Should normalize caret and lean left from text node into previous inline element text node', () => {
      setHtml('<p><b>a</b>b</p>');
      const range = normalizeRange([ 0, 1 ], 0, [ 0, 1 ], 0);
      assertRange(viewBlock.get(), range, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    });

    it('Should normalize caret and lean left from text node into previous text node', () => {
      setHtml('<p>a<b>b</b></p>');
      const range = normalizeRange([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0);
      assertRange(viewBlock.get(), range, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('Should normalize caret and lean left from inline element text node into previous inline element text node', () => {
      setHtml('<p><b>a</b><i>b</i></p>');
      const range = normalizeRange([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0);
      assertRange(viewBlock.get(), range, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    });

    it('Should normalize caret and lean left from before br in inline element into previous inline element text node', () => {
      setHtml('<p><b>a</b><i><br></i></p>');
      const range = normalizeRange([ 0, 1 ], 0, [ 0, 1 ], 0);
      assertRange(viewBlock.get(), range, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    });

    it('Should normalize on a caret between blocks', () => {
      setHtml('<p>a</p><p>b</p>');
      const range = normalizeRange([], 1, [], 1);
      assertRange(viewBlock.get(), range, [ 1, 0 ], 0, [ 1, 0 ], 0);
    });

    it('Should normalize from after br to before br when only child', () => {
      setHtml('<p><br /></p>');
      const range = normalizeRange([ 0 ], 1, [ 0 ], 1);
      assertRange(viewBlock.get(), range, [ 0 ], 0, [ 0 ], 0);
    });

    it('Should normalize from after br to before br', () => {
      setHtml('<p>a<br /></p>');
      const range = normalizeRange([ 0 ], 1, [ 0 ], 1);
      assertRange(viewBlock.get(), range, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('Should normalize before paragraph', () => {
      setHtml('<p>a</p>');
      const range = normalizeRange([], 0, [], 0);
      assertRange(viewBlock.get(), range, [ 0, 0 ], 0, [ 0, 0 ], 0);
    });

    it('Should normalize after paragraph', () => {
      setHtml('<p>a</p>');
      const range = normalizeRange([], 1, [], 1);
      assertRange(viewBlock.get(), range, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('Should normalize into caret container', () => {
      setHtml('<p><span id="_mce_caret">' + Zwsp.ZWSP + '</span><br /></p>');
      const range = normalizeRange([ 0 ], 1, [ 0 ], 1);
      assertRange(viewBlock.get(), range, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    });

    it('Should normalize into empty inline element before', () => {
      setHtml('<p><i><b></b></i><br /></p>');
      const range = normalizeRange([ 0 ], 1, [ 0 ], 1);
      assertRange(viewBlock.get(), range, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
    });
  });

  context('Normalize expanded selections', () => {
    it('Should normalize to before/after image', () => {
      setHtml('<p><img src="about:blank "></p>');
      const range = normalizeRange([], 0, [], 1);
      assertRange(viewBlock.get(), range, [ 0 ], 0, [ 0 ], 1);
    });

    it('Should normalize to text node in p', () => {
      setHtml('<p>a</p>');
      const range = normalizeRange([], 0, [], 1);
      assertRange(viewBlock.get(), range, [ 0, 0 ], 0, [ 0, 0 ], 1);
    });

    it('Should normalize to text node in middle p', () => {
      setHtml('<p>a</p><p>b</p><p>c</p>');
      const range = normalizeRange([], 1, [], 2);
      assertRange(viewBlock.get(), range, [ 1, 0 ], 0, [ 1, 0 ], 1);
    });

    it('Should normalize start from end of inline to start of next inline element', () => {
      setHtml('<p><b>a</b><i>b</i></p>');
      const range = normalizeRange([ 0, 0, 0 ], 1, [ 0, 1, 0 ], 1);
      assertRange(viewBlock.get(), range, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 1);
    });
  });

  it('Normalize on document', () => {
    const doc = document.implementation.createHTMLDocument('');
    const rng = document.createRange();
    const dom = DOMUtils(doc, { root_element: doc.body });

    doc.body.innerHTML = '<p>a</p>';

    rng.setStart(document, 0);
    rng.setEnd(document, 0);

    const normRng = NormalizeRange.normalize(dom, rng);
    assertRange(doc.body, normRng, [ 0, 0 ], 0, [ 0, 0 ], 0);
  });
});
