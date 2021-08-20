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

    assert.deepEqual(NodePath.create(getRoot(), getRoot().firstChild), [ 0 ]);
    assert.deepEqual(NodePath.create(getRoot(), getRoot().firstChild.firstChild), [ 0, 0 ]);
    assert.deepEqual(NodePath.create(getRoot(), getRoot().firstChild.lastChild.lastChild), [ 1, 1, 0 ]);
  });

  it('resolve', () => {
    setupHtml('<p>a<b>12<input></b></p>');

    LegacyUnit.equalDom(NodePath.resolve(getRoot(), NodePath.create(getRoot(), getRoot().firstChild)), getRoot().firstChild);
    LegacyUnit.equalDom(
      NodePath.resolve(getRoot(), NodePath.create(getRoot(), getRoot().firstChild.firstChild)),
      getRoot().firstChild.firstChild
    );
    LegacyUnit.equalDom(
      NodePath.resolve(getRoot(), NodePath.create(getRoot(), getRoot().firstChild.lastChild.lastChild)),
      getRoot().firstChild.lastChild.lastChild
    );
  });
});
