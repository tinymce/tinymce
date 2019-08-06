import { GeneralSteps, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
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

    const sFindAndAssertFound = (count: number) => GeneralSteps.sequence([
      tinyUi.sClickOnUi('Click find', '[role=dialog] button:contains("Find")'),
      tinyApis.sAssertContentPresence({
        '.mce-match-marker': count
      })
    ]);

    const sSelectPreference = (name: string) => GeneralSteps.sequence([
      tinyUi.sClickOnUi('Click preferences', 'button[title="Preferences"]'),
      tinyUi.sWaitForPopup('Wait for menu to show', '.tox-selected-menu[role=menu]'),
      tinyUi.sClickOnUi('Click match case menu item', '.tox-selected-menu[role=menu] div[title="' + name + '"]')
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
        sSelectPreference('Match case'),
        sFindAndAssertFound(1),
        Utils.sCloseDialog(tinyUi)
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'searchreplace',
    toolbar: 'searchreplace',
    base_url: '/project/tinymce/js/tinymce',
    theme: 'silver'
  }, success, failure);
});
