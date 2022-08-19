import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import * as NodePath from 'tinymce/core/dom/NodePath';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.dom.NodePathTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const getRoot = viewBlock.get;
  const setupHtml = viewBlock.update;

  it('create', () => {
    setupHtml('<p>a<b>12<input></b></p>');

    assert.deepEqual(NodePath.create(getRoot(), getRoot().firstChild as HTMLParagraphElement), [ 0 ]);
    assert.deepEqual(NodePath.create(getRoot(), getRoot().firstChild?.firstChild as Text), [ 0, 0 ]);
    assert.deepEqual(NodePath.create(getRoot(), getRoot().firstChild?.lastChild?.lastChild as HTMLInputElement), [ 1, 1, 0 ]);
  });

  it('resolve', () => {
    setupHtml('<p>a<b>12<input></b></p>');

    const para = getRoot().firstChild as HTMLParagraphElement;
    LegacyUnit.equalDom(NodePath.resolve(getRoot(), NodePath.create(getRoot(), para)) as Node, para);

    const firstText = para.firstChild as Text;
    LegacyUnit.equalDom(
      NodePath.resolve(getRoot(), NodePath.create(getRoot(), firstText)) as Text,
      firstText
    );

    const input = para.lastChild?.lastChild as HTMLInputElement;
    LegacyUnit.equalDom(
      NodePath.resolve(getRoot(), NodePath.create(getRoot(), input)) as HTMLInputElement,
      input
    );
  });
});
