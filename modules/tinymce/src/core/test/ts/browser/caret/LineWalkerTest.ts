import { describe, it } from '@ephox/bedrock-client';
import { Html, SugarElement } from '@ephox/sugar';
import { LegacyUnit } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as LineWalker from 'tinymce/core/caret/LineWalker';

import * as ViewBlock from '../../module/test/ViewBlock';

type LinePosClientRect = LineWalker.LinePosClientRect;

describe('browser.tinymce.core.LineWalkerTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const getRoot = viewBlock.get;

  it('positionsUntil', () => {
    let result, predicateCallCount = 0;

    const predicate = () => {
      predicateCallCount++;
      return false;
    };

    Html.set(SugarElement.fromDom(getRoot()), '<span contentEditable="false">a</span><span>b</span>');
    result = LineWalker.positionsUntil(1, getRoot(), predicate, getRoot().firstChild as HTMLSpanElement);
    assert.lengthOf(result, 3);
    LegacyUnit.equalDom(result[0].position.getNode() as Node, getRoot().lastChild as HTMLSpanElement);
    LegacyUnit.equalDom(result[1].position.getNode() as Node, getRoot().lastChild?.firstChild as Text);
    LegacyUnit.equalDom(result[2].position.getNode() as Node, getRoot().lastChild?.firstChild as Text);
    assert.equal(predicateCallCount, 3);

    predicateCallCount = 0;
    Html.set(SugarElement.fromDom(getRoot()), '<span>a</span><span contentEditable="false">b</span>');
    result = LineWalker.positionsUntil(-1, getRoot(), predicate, getRoot().lastChild as HTMLSpanElement);
    assert.lengthOf(result, 3);
    LegacyUnit.equalDom(result[0].position.getNode() as Node, getRoot().lastChild as HTMLSpanElement);
    LegacyUnit.equalDom(result[1].position.getNode() as Node, getRoot().firstChild?.firstChild as Text);
    LegacyUnit.equalDom(result[2].position.getNode() as Node, getRoot().firstChild?.firstChild as Text);
    assert.equal(predicateCallCount, 3);
  });

  it('upUntil', () => {
    let predicateCallCount = 0;

    const predicate = () => {
      predicateCallCount++;
      return false;
    };

    Html.set(SugarElement.fromDom(getRoot()), '<p>a</p><p>b</p><p>c</p>');

    const caretPosition = CaretPosition(getRoot().lastChild?.lastChild as Text, 1);
    const result = LineWalker.upUntil(getRoot(), predicate, caretPosition);

    assert.lengthOf(result, 3);
    assert.equal(result[0].line, 0);
    assert.equal(result[1].line, 1);
    assert.equal(result[2].line, 2);
    assert.equal(predicateCallCount, 3);
  });

  it('downUntil', () => {
    let predicateCallCount = 0;

    const predicate = () => {
      predicateCallCount++;
      return false;
    };

    Html.set(SugarElement.fromDom(getRoot()), '<p>a</p><p>b</p><p>c</p>');

    const caretPosition = CaretPosition(getRoot().firstChild?.firstChild as Text, 0);
    const result = LineWalker.downUntil(getRoot(), predicate, caretPosition);

    assert.lengthOf(result, 3);
    assert.equal(result[0].line, 0);
    assert.equal(result[1].line, 1);
    assert.equal(result[2].line, 2);
    assert.equal(predicateCallCount, 3);
  });

  it('isAboveLine', () => {
    assert.isTrue(LineWalker.isAboveLine(5)({ line: 10 } as LinePosClientRect));
    assert.isFalse(LineWalker.isAboveLine(5)({ line: 2 } as LinePosClientRect));
  });

  it('isLine', () => {
    assert.isTrue(LineWalker.isLine(3)({ line: 3 } as LinePosClientRect));
    assert.isFalse(LineWalker.isLine(3)({ line: 4 } as LinePosClientRect));
  });
});
