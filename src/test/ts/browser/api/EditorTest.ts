import { Assertions, Chain, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import ApiChains from 'ephox/mcagar/api/ApiChains';
import Editor from 'ephox/mcagar/api/Editor';
import { TinyVersions } from 'ephox/mcagar/api/Main';
import { cAssertEditorVersion } from '../../module/AssertVersion';

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
    ])),
    TinyVersions.sWithVersion('4.8.x', Chain.asStep({}, [
      Editor.cCreateInline,
      cAssertEditorVersion(4, 8),
      Editor.cRemove
    ])),
    TinyVersions.sWithVersion('5.0.x', Chain.asStep({}, [
      Editor.cCreateInline,
      cAssertEditorVersion(5, 0),
      Editor.cRemove
    ]))
  ], () => {
    success();
  }, failure);
});

