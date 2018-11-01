import { Pipeline } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import ApiChains from 'ephox/mcagar/api/ApiChains';
import Editor from 'ephox/mcagar/api/Editor';
import { UnitTest } from '@ephox/bedrock';
import { TinyVersions } from 'ephox/mcagar/api/Main';
import { sAssertVersion, cAssertEditorVersion } from '../../module/AssertVersion';

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
    ]),
    TinyVersions.sWithVersion('4.5.x', Chain.asStep({}, [
      Editor.cCreateInline,
      cAssertEditorVersion(4, 5),
      Editor.cRemove
    ]))
  ], () => {
    success();
  }, failure);
});

