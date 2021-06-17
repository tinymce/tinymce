import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as DeleteUtils from 'tinymce/core/delete/DeleteUtils';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.delete.DeleteUtilsTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const setHtml = viewBlock.update;

  const getParentTextBlock = (elementPath: number[]) => {
    const element = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), elementPath).getOrDie();
    return DeleteUtils.getParentBlock(SugarElement.fromDom(viewBlock.get()), element);
  };

  const assertBlock = (actualBlock: Optional<SugarElement<Node>>, elementPath: number[]) => {
    const expectedBlock = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), elementPath).getOrDie();
    Assertions.assertDomEq('Should be the expected block element', expectedBlock, actualBlock.getOrDie());
  };

  const willDeleteLastPositionInElement = (forward: boolean, caretPath: number[], caretOffset: number, elementPath: number[]) => {
    const element = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), elementPath).getOrDie();
    const caretNode = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), caretPath).getOrDie();

    return DeleteUtils.willDeleteLastPositionInElement(forward, CaretPosition(caretNode.dom, caretOffset), element.dom);
  };

  const assertNone = (actualBlock: Optional<unknown>) => {
    assert.isTrue(actualBlock.isNone(), 'Should be the none but got some');
  };

  context('getParentTextBlock', () => {
    it('Should be the paragraph block', () => {
      setHtml('<p>a</p>');
      const parentOpt = getParentTextBlock([ 0, 0 ]);
      assertBlock(parentOpt, [ 0 ]);
    });

    it('Should be the paragraph block inside the div', () => {
      setHtml('<div><p>a</p></div>');
      const parentOpt = getParentTextBlock([ 0, 0, 0 ]);
      assertBlock(parentOpt, [ 0, 0 ]);
    });

    it('Should be none in inline elements', () => {
      setHtml('<span>a</span>');
      const parentOpt = getParentTextBlock([ 0, 0 ]);
      assertNone(parentOpt);
    });

    it('Should be none text nodes', () => {
      setHtml('a');
      const parentOpt = getParentTextBlock([ 0 ]);
      assertNone(parentOpt);
    });

    it('Should be none on root element', () => {
      setHtml('');
      const parentOpt = getParentTextBlock([]);
      assertNone(parentOpt);
    });
  });

  context('Will delete last position', () => {
    it('Should delete element since caret is before last character', () => {
      setHtml('<p>a</p>');
      const willDelete = willDeleteLastPositionInElement(true, [ 0, 0 ], 0, [ 0 ]);
      assert.isTrue(willDelete, 'Should be true');
    });

    it('Should delete element since caret is after last character', () => {
      setHtml('<p>a</p>');
      const willDelete = willDeleteLastPositionInElement(false, [ 0, 0 ], 1, [ 0 ]);
      assert.isTrue(willDelete, 'Should be true');
    });

    it('Should not delete element since caret is after last character', () => {
      setHtml('<p>a</p>');
      const willDelete = willDeleteLastPositionInElement(true, [ 0, 0 ], 1, [ 0 ]);
      assert.isFalse(willDelete, 'Should be false');
    });

    it('Should not delete element since caret is before last character', () => {
      setHtml('<p>a</p>');
      const willDelete = willDeleteLastPositionInElement(false, [ 0, 0 ], 0, [ 0 ]);
      assert.isFalse(willDelete, 'Should be false');
    });

    it('Should not delete element since caret is not before last character', () => {
      setHtml('<p>ab</p>');
      const willDelete = willDeleteLastPositionInElement(true, [ 0, 0 ], 1, [ 0 ]);
      assert.isFalse(willDelete, 'Should be false');
    });

    it('Should not delete element since caret is not after last character', () => {
      setHtml('<p>ab</p>');
      const willDelete = willDeleteLastPositionInElement(false, [ 0, 0 ], 1, [ 0 ]);
      assert.isFalse(willDelete, 'Should be false');
    });

    it('Should delete element since the element is empty (forwards: true)', () => {
      setHtml('<p></p>');
      const willDelete = willDeleteLastPositionInElement(true, [ 0 ], 0, [ 0 ]);
      assert.isTrue(willDelete, 'Should be true');
    });

    it('Should delete element since the element is empty (forwards: false)', () => {
      setHtml('<p></p>');
      const willDelete = willDeleteLastPositionInElement(false, [ 0 ], 0, [ 0 ]);
      assert.isTrue(willDelete, 'Should be true');
    });
  });
});
