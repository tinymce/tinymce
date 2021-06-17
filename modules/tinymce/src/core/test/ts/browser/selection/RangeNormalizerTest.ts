import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as RangeNormalizer from 'tinymce/core/selection/RangeNormalizer';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.selection.RangeNormalizerTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const setHtml = viewBlock.update;

  const normalizeRange = (rng: Range) => RangeNormalizer.normalize(rng);

  const createRange = (startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
    const startContainer = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie();
    const endContainer = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), endPath).getOrDie();
    const rng = document.createRange();
    rng.setStart(startContainer.dom, startOffset);
    rng.setEnd(endContainer.dom, endOffset);
    return rng;
  };

  const assertRange = (rng: Range, startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
    const startContainer = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie();
    const endContainer = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), endPath).getOrDie();

    Assertions.assertDomEq('Should be expected startContainer', startContainer, SugarElement.fromDom(rng.startContainer));
    assert.equal(rng.startOffset, startOffset, 'Should be expected startOffset');
    Assertions.assertDomEq('Should be expected endContainer', endContainer, SugarElement.fromDom(rng.endContainer));
    assert.equal(rng.endOffset, endOffset, 'Should be expected endOffset');
  };

  it('Normalize range no change', () => {
    setHtml('<p><br></p>');
    const rng = createRange([ 0 ], 0, [ 0 ], 0);
    const normRng = normalizeRange(rng);
    assertRange(normRng, [ 0 ], 0, [ 0 ], 0);
  });

  it('Normalize webkit triple click selection paragraph', () => {
    setHtml('<blockquote><p>a</p></blockquote><p>b</p>');
    const rng = createRange([ 0, 0, 0 ], 0, [ 1 ], 0);
    const normRng = normalizeRange(rng);
    assertRange(normRng, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
  });

  it('Normalize webkit triple click selection heading', () => {
    setHtml('<blockquote><p>a</p></blockquote><h1>b</h1>');
    const rng = createRange([ 0, 0, 0 ], 0, [ 1 ], 0);
    const normRng = normalizeRange(rng);
    assertRange(normRng, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
  });

  it('Normalize webkit triple click selection headings', () => {
    setHtml('<blockquote><h1>a</h1></blockquote><h1>b</h1>');
    const rng = createRange([ 0, 0, 0 ], 0, [ 1 ], 0);
    const normRng = normalizeRange(rng);
    assertRange(normRng, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
  });

  it('Normalize webkit triple click selection divs', () => {
    setHtml('<blockquote><div>a</div></blockquote><div>b</div>');
    const rng = createRange([ 0, 0, 0 ], 0, [ 1 ], 0);
    const normRng = normalizeRange(rng);
    assertRange(normRng, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
  });

  it('Normalize webkit triple click selection between LI:s', () => {
    setHtml('<ul><li>a</li></ul><ul><li>b</li></ul>');
    const rng = createRange([ 0, 0, 0 ], 0, [ 1, 0 ], 0);
    const normRng = normalizeRange(rng);
    assertRange(normRng, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
  });

  it('Normalize from block start to previous block end', () => {
    setHtml('<p>a</p><p>b<p>');
    const rng = createRange([ 0, 0 ], 0, [ 1, 0 ], 0);
    const normRng = normalizeRange(rng);
    assertRange(normRng, [ 0, 0 ], 0, [ 0, 0 ], 1);
  });

  it('Do not normalize when end position has a valid previous position in the block', () => {
    setHtml('<p>a</p><p>b<p>');
    const rng = createRange([ 0, 0 ], 0, [ 1, 0 ], 1);
    const normRng = normalizeRange(rng);
    assertRange(normRng, [ 0, 0 ], 0, [ 1, 0 ], 1);
  });

  it('Do not normalize when selection is on inline elements', () => {
    setHtml('<b>a</b><b>b<b>');
    const rng = createRange([ 0, 0 ], 0, [ 1, 0 ], 0);
    const normRng = normalizeRange(rng);
    assertRange(normRng, [ 0, 0 ], 0, [ 1, 0 ], 0);
  });
});
