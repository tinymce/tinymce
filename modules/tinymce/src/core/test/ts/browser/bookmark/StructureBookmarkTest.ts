import { describe, it } from '@ephox/bedrock-client';
import { Hierarchy, Html, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { getBookmark, resolveBookmark } from 'tinymce/core/bookmark/StructureBookmark';

describe('browser.tinymce.core.StructureBookmarkTest', () => {
  const testBookmark = (testCase: { html: string; startPath: number[]; startOffset: number; endPath: number[]; endOffset: number }) => {
    const scope = SugarElement.fromTag('div');
    Html.set(scope, testCase.html);

    const startContainer = Hierarchy.follow(scope, testCase.startPath).getOrDie('Failed to get start container');
    const endContainer = Hierarchy.follow(scope, testCase.endPath).getOrDie('Failed to get end container');

    const inputRange = new window.Range();
    inputRange.setStart(startContainer.dom, testCase.startOffset);
    inputRange.setEnd(endContainer.dom, testCase.endOffset);

    const bm = getBookmark(inputRange);
    const resolvedRange = resolveBookmark(bm);

    const actualStartPath = Hierarchy.path(scope, SugarElement.fromDom(resolvedRange.startContainer)).getOrDie('Failed to get start container');
    const actualEndPath = Hierarchy.path(scope, SugarElement.fromDom(resolvedRange.endContainer)).getOrDie('Failed to get end container');

    assert.deepEqual(actualStartPath, testCase.startPath, 'Should resolve back to the original start path');
    assert.deepEqual(actualEndPath, testCase.endPath, 'Should resolve back to the original end path');
    assert.equal(Html.get(scope), testCase.html, 'Should be the original html');
  };

  it('Simple text node selection range', () => testBookmark({
    html: 'abc', startPath: [ 0 ], startOffset: 1, endPath: [ 0 ], endOffset: 2
  }));

  it('Simple text node caret range', () => testBookmark({
    html: 'abc', startPath: [ 0 ], startOffset: 1, endPath: [ 0 ], endOffset: 1
  }));

  it('Element selection', () => testBookmark({
    html: '<div><br></div>', startPath: [ 0 ], startOffset: 0, endPath: [ 0 ], endOffset: 1
  }));

  it('Element selection multiple elements', () => testBookmark({
    html: '<div><br><br></div>', startPath: [ 0 ], startOffset: 0, endPath: [ 0 ], endOffset: 2
  }));

  it('Element selection caret before', () => testBookmark({
    html: '<div><br></div>', startPath: [ 0 ], startOffset: 0, endPath: [ 0 ], endOffset: 0
  }));

  it('Element selection caret after', () => testBookmark({
    html: '<div><br></div>', startPath: [ 0 ], startOffset: 1, endPath: [ 0 ], endOffset: 1
  }));
});

