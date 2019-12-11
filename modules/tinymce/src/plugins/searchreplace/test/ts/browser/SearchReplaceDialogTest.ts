import { GeneralSteps, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import SearchreplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.searchreplace.SearchReplaceDialogTest', (success, failure) => {
  Theme();
  SearchreplacePlugin();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const sAssertFound = (count: number) => tinyApis.sAssertContentPresence({
      '.mce-match-marker': count
    });

    const sFindAndAssertFound = (count: number) => GeneralSteps.sequence([
      Utils.sClickFind(tinyUi),
      sAssertFound(count)
    ]);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'SearchReplace: Test no content selected', [
        tinyApis.sSetContent('<p>fish fish fish</p>'),
        Utils.sOpenDialog(tinyUi),
        Utils.sAssertFieldValue(tinyUi, 'input.tox-textfield[placeholder="Find"]', ''),
        Utils.sCloseDialog(tinyUi)
      ]),
      Log.stepsAsStep('TBA', 'SearchReplace: Test some content selected', [
        tinyApis.sSetContent('<p>fish fish fish</p>'),
        tinyApis.sSetSelection([0, 0], 5, [0, 0], 9),
        Utils.sOpenDialog(tinyUi),
        Utils.sAssertFieldValue(tinyUi, 'input.tox-textfield[placeholder="Find"]', 'fish'),
        sFindAndAssertFound(3),
        Utils.sCloseDialog(tinyUi)
      ]),
      Log.stepsAsStep('TBA', 'SearchReplace: Test some content selected with matchcase enabled', [
        tinyApis.sSetContent('<p>fish Fish fish</p>'),
        tinyApis.sSetSelection([0, 0], 5, [0, 0], 9),
        Utils.sOpenDialog(tinyUi),
        Utils.sAssertFieldValue(tinyUi, 'input.tox-textfield[placeholder="Find"]', 'Fish'),
        Utils.sSelectPreference(tinyUi, 'Match case'),
        sFindAndAssertFound(1),
        Utils.sSelectPreference(tinyUi, 'Match case'),
        Utils.sCloseDialog(tinyUi)
      ]),
      Log.stepsAsStep('TBA', 'SearchReplace: Test some content selected with wholewords enabled', [
        tinyApis.sSetContent('<p>ttt TTT ttt ttttt</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 3),
        Utils.sOpenDialog(tinyUi),
        Utils.sAssertFieldValue(tinyUi, 'input.tox-textfield[placeholder="Find"]', 'ttt'),
        Utils.sSelectPreference(tinyUi, 'Find whole words only'),
        sFindAndAssertFound(3),
        Utils.sSelectPreference(tinyUi, 'Find whole words only'),
        Utils.sCloseDialog(tinyUi)
      ]),
      Log.stepsAsStep('TBA', 'SearchReplace: Test some content selected while changing preferences', [
        tinyApis.sSetContent('<p>fish fish Fish fishy</p>'),
        tinyApis.sSetSelection([0, 0], 5, [0, 0], 9),
        Utils.sOpenDialog(tinyUi),
        Utils.sAssertFieldValue(tinyUi, 'input.tox-textfield[placeholder="Find"]', 'fish'),
        sFindAndAssertFound(4),
        Utils.sSelectPreference(tinyUi, 'Match case'),
        sAssertFound(0),
        sFindAndAssertFound(3),
        Utils.sSelectPreference(tinyUi, 'Find whole words only'),
        sAssertFound(0),
        sFindAndAssertFound(2),
        Utils.sCloseDialog(tinyUi)
      ]),
    ], onSuccess, onFailure);
  }, {
    plugins: 'searchreplace',
    toolbar: 'searchreplace',
    base_url: '/project/tinymce/js/tinymce',
    theme: 'silver'
  }, success, failure);
});
