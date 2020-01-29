import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import NodePath from 'tinymce/core/dom/NodePath';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.dom.NodePathTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  const getRoot = function () {
    return viewBlock.get();
  };

  const setupHtml = function (html) {
    viewBlock.update(html);
  };

  suite.test('create', function () {
    setupHtml('<p>a<b>12<input></b></p>');

    LegacyUnit.deepEqual(NodePath.create(getRoot(), getRoot().firstChild), [0]);
    LegacyUnit.deepEqual(NodePath.create(getRoot(), getRoot().firstChild.firstChild), [0, 0]);
    LegacyUnit.deepEqual(NodePath.create(getRoot(), getRoot().firstChild.lastChild.lastChild), [1, 1, 0]);
  });

  suite.test('resolve', function () {
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

  viewBlock.attach();
  Pipeline.async({}, suite.toSteps({}), function () {
    viewBlock.detach();
    success();
  }, failure);
});
