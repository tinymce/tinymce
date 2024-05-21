import { context, describe, it } from '@ephox/bedrock-client';
import { Hierarchy, Html, Insert, SugarElement, Traverse } from '@ephox/sugar';
import { assert } from 'chai';

import * as StructureBookmark from 'tinymce/core/bookmark/StructureBookmark';

interface BookmarkTestCase {
  html: string;
  startPath: number[];
  startOffset: number;
  endPath: number[];
  endOffset: number;
  mutation?: (el: SugarElement<HTMLElement>) => void;
  expectedHtml?: string;
  expectedStartPath?: number[];
  expectedStartOffset?: number;
  expectedEndPath?: number[];
  expectedEndOffset?: number;
}

describe('browser.tinymce.core.StructureBookmarkTest', () => {
  const testBookmark = (testCase: BookmarkTestCase) => {
    const { html, startPath, startOffset, endPath, endOffset, mutation } = testCase;
    const { expectedHtml, expectedStartPath, expectedStartOffset, expectedEndPath, expectedEndOffset } = testCase;
    const scope = SugarElement.fromTag('div');

    Html.set(scope, html);

    const startContainer = Hierarchy.follow(scope, startPath).getOrDie('Failed to get start container');
    const endContainer = Hierarchy.follow(scope, endPath).getOrDie('Failed to get end container');

    const inputRange = new window.Range();
    inputRange.setStart(startContainer.dom, startOffset);
    inputRange.setEnd(endContainer.dom, endOffset);

    const bm = StructureBookmark.getBookmark(inputRange, () => document.createElement('span'));
    if (mutation) {
      mutation(scope);
    }
    const resolvedRange = StructureBookmark.resolveBookmark(bm);

    const actualStartPath = Hierarchy.path(scope, SugarElement.fromDom(resolvedRange.startContainer)).getOrDie('Failed to get start container');
    const actualEndPath = Hierarchy.path(scope, SugarElement.fromDom(resolvedRange.endContainer)).getOrDie('Failed to get end container');

    assert.deepEqual(actualStartPath, expectedStartPath ?? startPath, 'Should be the expected start path');
    assert.deepEqual(actualEndPath, expectedEndPath ?? endPath, 'Should be the expected end path');
    assert.deepEqual(resolvedRange.startOffset, expectedStartOffset ?? startOffset, 'Should be the expected start offset');
    assert.deepEqual(resolvedRange.endOffset, expectedEndOffset ?? endOffset, 'Should be the expected end offset');
    assert.equal(Html.get(scope), expectedHtml ?? html, 'Should be the expected html');
  };

  context('Non mutation', () => {
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

  context('Element selection on dom mutation', () => {
    it('Element selection caret after should resolve back if wrapped', () => testBookmark({
      html: '<div><br></div>',
      startPath: [ 0 ], startOffset: 1, endPath: [ 0 ], endOffset: 1,
      mutation: (scope) => {
        Traverse.firstChild(scope).each((child) => Insert.wrap(child, SugarElement.fromTag('div')));
      },
      expectedStartPath: [ 0, 0 ], expectedStartOffset: 1, expectedEndPath: [ 0, 0 ], expectedEndOffset: 1,
      expectedHtml: '<div><div><br></div></div>'
    }));

    it('Element selection caret after should resolve back if nodes are added before it', () => testBookmark({
      html: '<div><br></div>',
      startPath: [ 0 ], startOffset: 1, endPath: [ 0 ], endOffset: 1,
      mutation: (scope) => {
        Traverse.firstChild(scope).each((child) => Insert.prepend(child, SugarElement.fromTag('b')));
      },
      expectedStartPath: [ 0 ], expectedStartOffset: 2, expectedEndPath: [ 0 ], expectedEndOffset: 2,
      expectedHtml: '<div><b></b><br></div>'
    }));

    it('Element selection caret after should resolve back if nodes are added on a parent before it', () => testBookmark({
      html: '<div><br></div>',
      startPath: [ 0 ], startOffset: 1, endPath: [ 0 ], endOffset: 1,
      mutation: (scope) => {
        Insert.prepend(scope, SugarElement.fromTag('b'));
      },
      expectedStartPath: [ 1 ], expectedStartOffset: 1, expectedEndPath: [ 1 ], expectedEndOffset: 1,
      expectedHtml: '<b></b><div><br></div>'
    }));

    it('Element selection on BR should resolve back if nodes are added on a parent before it', () => testBookmark({
      html: '<div><br></div>',
      startPath: [ 0 ], startOffset: 0, endPath: [ 0 ], endOffset: 1,
      mutation: (scope) => {
        Insert.prepend(scope, SugarElement.fromTag('b'));
      },
      expectedStartPath: [ 1 ], expectedStartOffset: 0, expectedEndPath: [ 1 ], expectedEndOffset: 1,
      expectedHtml: '<b></b><div><br></div>'
    }));
  });

  context('Text selection on dom mutation', () => {
    it('Text selection caret after should resolve back if wrapped', () => testBookmark({
      html: '<div>foo</div>',
      startPath: [ 0, 0 ], startOffset: 1, endPath: [ 0, 0 ], endOffset: 1,
      mutation: (scope) => {
        Traverse.firstChild(scope).each((child) => Insert.wrap(child, SugarElement.fromTag('div')));
      },
      expectedStartPath: [ 0, 0, 0 ], expectedStartOffset: 1, expectedEndPath: [ 0, 0, 0 ], expectedEndOffset: 1,
      expectedHtml: '<div><div>foo</div></div>'
    }));

    it('Text selection caret after should resolve back if nodes are added before it', () => testBookmark({
      html: '<div>foo</div>',
      startPath: [ 0, 0 ], startOffset: 1, endPath: [ 0, 0 ], endOffset: 1,
      mutation: (scope) => {
        Traverse.firstChild(scope).each((child) => Insert.prepend(child, SugarElement.fromTag('b')));
      },
      expectedStartPath: [ 0, 1 ], expectedStartOffset: 1, expectedEndPath: [ 0, 1 ], expectedEndOffset: 1,
      expectedHtml: '<div><b></b>foo</div>'
    }));

    it('Text selection caret after should resolve back if nodes are added on a parent before it', () => testBookmark({
      html: '<div>foo</div>',
      startPath: [ 0, 0 ], startOffset: 1, endPath: [ 0, 0 ], endOffset: 1,
      mutation: (scope) => {
        Insert.prepend(scope, SugarElement.fromTag('b'));
      },
      expectedStartPath: [ 1, 0 ], expectedStartOffset: 1, expectedEndPath: [ 1, 0 ], expectedEndOffset: 1,
      expectedHtml: '<b></b><div>foo</div>'
    }));

    it('Text selection should resolve back if nodes are added on a parent before it', () => testBookmark({
      html: '<div>foo</div>',
      startPath: [ 0, 0 ], startOffset: 0, endPath: [ 0, 0 ], endOffset: 1,
      mutation: (scope) => {
        Insert.prepend(scope, SugarElement.fromTag('b'));
      },
      expectedStartPath: [ 1, 0 ], expectedStartOffset: 0, expectedEndPath: [ 1, 0 ], expectedEndOffset: 1,
      expectedHtml: '<b></b><div>foo</div>'
    }));
  });
});

