import { Assertions, Chain, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import ApiChains from 'ephox/mcagar/api/ApiChains';
import Editor from 'ephox/mcagar/api/Editor';

UnitTest.asynctest('SelectionTest', (success, failure) => {
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
  ], () => {
    success();
  }, failure);
});

