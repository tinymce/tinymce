import { Assertions, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Class, Element, SelectorFilter } from '@ephox/sugar';

import SearchreplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.searchreplace.SearchReplaceDialogCyclingTest', (success, failure) => {
  Theme();
  SearchreplacePlugin();

  enum Direction {
    FORWARDS,
    BACKWARDS
  }

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const sFind = Utils.sClickFind(tinyUi);
    const sNext = Utils.sClickNext(tinyUi);
    const sPrev = Utils.sClickPrev(tinyUi);
    const sSelectPreference = (name: string) => Utils.sSelectPreference(tinyUi, name);

    const sAssertMatchFound = (index: number) => Step.sync(() => {
      const matches = SelectorFilter.descendants(Element.fromDom(editor.getBody()), '.mce-match-marker');
      const elem = matches[index];
      Assertions.assertEq(`Check match ${index} is marked as selected`, true, Class.has(elem, 'mce-match-marker-selected'));
    });

    const sTestCycling = (sCycle: Step<any, any>, dir: Direction) => [
      Log.stepsAsStep('TINY-4506', 'SearchReplace: Test cycling through results without any preferences', [
        tinyApis.sSetContent('<p>fish fish fish</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 4),
        Utils.sOpenDialog(tinyUi),
        Utils.sAssertFieldValue(tinyUi, 'input.tox-textfield[placeholder="Find"]', 'fish'),
        sFind,
        sAssertMatchFound(0),
        sCycle,
        sAssertMatchFound(dir === Direction.FORWARDS ? 1 : 2),
        sCycle,
        sAssertMatchFound(dir === Direction.FORWARDS ? 2 : 1),
        sCycle,
        sAssertMatchFound(0),
        Utils.sCloseDialog(tinyUi)
      ]),
      Log.stepsAsStep('TINY-4506', 'SearchReplace: Test cycling through results with matchcase enabled', [
        tinyApis.sSetContent('<p>fish Fish fish Fish</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 5, [ 0, 0 ], 9),
        Utils.sOpenDialog(tinyUi),
        Utils.sAssertFieldValue(tinyUi, 'input.tox-textfield[placeholder="Find"]', 'Fish'),
        sSelectPreference('Match case'),
        sFind,
        sAssertMatchFound(0),
        sCycle,
        sAssertMatchFound(1),
        sCycle,
        sAssertMatchFound(0),
        sSelectPreference('Match case'),
        Utils.sCloseDialog(tinyUi)
      ]),
      Log.stepsAsStep('TINY-4506', 'SearchReplace: Test cycling through results with wholewords enabled', [
        tinyApis.sSetContent('<p>ttt TTT ttt ttttt</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 3),
        Utils.sOpenDialog(tinyUi),
        Utils.sAssertFieldValue(tinyUi, 'input.tox-textfield[placeholder="Find"]', 'ttt'),
        sSelectPreference('Find whole words only'),
        sFind,
        sAssertMatchFound(0),
        sCycle,
        sAssertMatchFound(dir === Direction.FORWARDS ? 1 : 2),
        sCycle,
        sAssertMatchFound(dir === Direction.FORWARDS ? 2 : 1),
        sCycle,
        sAssertMatchFound(0),
        sSelectPreference('Find whole words only'),
        Utils.sCloseDialog(tinyUi)
      ]),
      Log.stepsAsStep('TINY-4506', 'SearchReplace: Test cycling through results with special characters', [
        tinyApis.sSetContent('<p>^^ ^^ ^^ fish</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 2),
        Utils.sOpenDialog(tinyUi),
        Utils.sAssertFieldValue(tinyUi, 'input.tox-textfield[placeholder="Find"]', '^^'),
        sFind,
        sAssertMatchFound(0),
        sCycle,
        sAssertMatchFound(dir === Direction.FORWARDS ? 1 : 2),
        sCycle,
        sAssertMatchFound(dir === Direction.FORWARDS ? 2 : 1),
        sCycle,
        sAssertMatchFound(0),
        Utils.sCloseDialog(tinyUi)
      ])
    ];

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-4506', 'SearchReplace: Test cycling using find', sTestCycling(sFind, Direction.FORWARDS)),
      Log.stepsAsStep('TINY-4506', 'SearchReplace: Test cycling using next', sTestCycling(sNext, Direction.FORWARDS)),
      Log.stepsAsStep('TINY-4506', 'SearchReplace: Test cycling using previous', sTestCycling(sPrev, Direction.BACKWARDS))
    ], onSuccess, onFailure);
  }, {
    plugins: 'searchreplace',
    toolbar: 'searchreplace',
    base_url: '/project/tinymce/js/tinymce',
    theme: 'silver'
  }, success, failure);
});
