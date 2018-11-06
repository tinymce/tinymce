import { Pipeline } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import ApiChains from 'ephox/mcagar/api/ApiChains';
import Editor from 'ephox/mcagar/api/Editor';
import { UnitTest } from '@ephox/bedrock';
import { TinyVersions } from 'ephox/mcagar/api/Main';
import { cAssertEditorVersion } from '../../module/AssertVersion';

UnitTest.asynctest('SelectionTest', (success, failure) => {

  const sTestStep = (major, minor) => Chain.asStep({}, [
    Editor.cCreate,
    ApiChains.cFocus,
    cAssertEditorVersion(major, minor),
    ApiChains.cSetContent('<p>this is one paragraph</p><p>This is another</p>'),
    ApiChains.cSetSelection([ 0, 0 ], 'this'.length, [ 1, 0 ], 'This is'.length),
    ApiChains.cAssertSelection([ 0, 0 ], 'this'.length, [ 1, 0 ], 'This is'.length),

    ApiChains.cSetCursor([ 0, 0 ], 't'.length),
    ApiChains.cAssertSelection([ 0, 0 ], 't'.length, [ 0, 0 ], 't'.length),

    ApiChains.cSetSelectionFrom({
      start: {
        element: [ 0, 0 ], offset: 'this '.length
      },
      finish: {
        element: [ 1 ], offset: 0
      }
    }),
    ApiChains.cAssertSelection([ 0, 0 ], 'this '.length, [ 1 ], 0),
    ApiChains.cSetSelectionFrom({
      element: [ 0 ],
      offset: 1
    }),
    ApiChains.cAssertSelection([ 0 ], 1, [ 0 ], 1),

    ApiChains.cSetContent('<p>one <strong>word</strong> here</p>'),
    ApiChains.cSelect('p', [ 1 ]),
    // This may not be normalised across all browsers
    ApiChains.cAssertSelection([ 0 ], 1, [ 0 ], 2),
    Editor.cRemove
  ]);

  Pipeline.async({}, [
    TinyVersions.sWithVersion('4.5.x', sTestStep(4, 5)),
    TinyVersions.sWithVersion('4.8.x', sTestStep(4, 8)),
    TinyVersions.sWithVersion('5.0.x', sTestStep(5, 0))
  ], function () {
    success();
  }, failure);
});

