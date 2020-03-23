import { Assertions, Chain, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { ApiChains } from 'ephox/mcagar/api/ApiChains';
import * as Editor from 'ephox/mcagar/api/Editor';

UnitTest.asynctest('SelectionTest', (success, failure) => {
  const cAssertEditorExists = Chain.op(function (editor) {
    Assertions.assertEq('asserting that editor is truthy', true, !!editor);
  });

  Pipeline.async({}, [
    Chain.asStep({}, [
      Editor.cFromSettings({ base_url: '/project/tinymce/js/tinymce', inline: true }),
      ApiChains.cFocus,
      cAssertEditorExists,
      Editor.cRemove
    ])
  ], () => {
    success();
  }, failure);
});
