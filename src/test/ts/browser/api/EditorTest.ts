import { Pipeline } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import ApiChains from 'ephox/mcagar/api/ApiChains';
import Editor from 'ephox/mcagar/api/Editor';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('SelectionTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var cAssertEditorExists = Chain.op(function (editor) {
    Assertions.assertEq("asserting that editor is truthy", true, !!editor);
  });

  Pipeline.async({}, [
    Chain.asStep({}, [
      Editor.cCreateInline,
      ApiChains.cFocus,
      cAssertEditorExists,
      Editor.cRemove
    ])
  ], function () {
    success();
  }, failure);
});

