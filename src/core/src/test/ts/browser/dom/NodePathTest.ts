import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import NodePath from 'tinymce/core/dom/NodePath';
import ViewBlock from 'tinymce/core/test/ViewBlock';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.core.dom.NodePathTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var suite = LegacyUnit.createSuite();
  var viewBlock = new ViewBlock();

  var getRoot = function () {
    return viewBlock.get();
  };

  var setupHtml = function (html) {
    viewBlock.update(html);
  };

  suite.test("create", function () {
    setupHtml('<p>a<b>12<input></b></p>');

    LegacyUnit.deepEqual(NodePath.create(getRoot(), getRoot().firstChild), [0]);
    LegacyUnit.deepEqual(NodePath.create(getRoot(), getRoot().firstChild.firstChild), [0, 0]);
    LegacyUnit.deepEqual(NodePath.create(getRoot(), getRoot().firstChild.lastChild.lastChild), [1, 1, 0]);
  });

  suite.test("resolve", function () {
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

