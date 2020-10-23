import { Chain, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { ApiChains } from 'ephox/mcagar/api/ApiChains';
import * as Editor from 'ephox/mcagar/api/Editor';

UnitTest.asynctest('SelectionTest', (success, failure) => {

  const sTestStep = Chain.asStep({}, [
    Editor.cFromSettings({ base_url: '/project/tinymce/js/tinymce' }),
    ApiChains.cFocus,
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
    sTestStep
  ], function () {
    success();
  }, failure);
});
