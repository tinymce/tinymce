import { Chain, Log, Mouse, Pipeline, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import SearchreplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.searchreplace.SearchReplacePrevNextTest', (success, failure) => {

Theme();
SearchreplacePlugin();

TinyLoader.setup(function (editor, onSuccess, onFailure) {
  const tinyApis = TinyApis(editor);
  const tinyUi = TinyUi(editor);

  Pipeline.async({},
    Log.steps('TBA', 'SearchReplace: Test Prev and Next buttons become enabled and disabled at right places when multiple matches exist', [
      tinyApis.sSetContent('<p>fish fish fish</p>'),
      Utils.sOpenDialog(tinyUi),
      Chain.asStep({}, [
        Chain.fromParent(tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'), [
          Chain.fromChains([
            UiFinder.cFindIn('label:contains("Find") + input'),
            UiControls.cSetValue('fish')
          ]),
          Chain.fromChains([
            UiFinder.cFindIn('button:contains("Find")'),
            Mouse.cClick
          ]),
          UiFinder.cFindIn('button[title="Next"]'),
          UiFinder.cWaitFor('wait for next button to be enabled', 'button[disabled!="disabled"]'),
          Chain.fromChains([
            UiFinder.cFindIn('button[title="Next"]'),
            Mouse.cClick
          ]),
          UiFinder.cFindIn('button[title="Previous"]'),
          UiFinder.cWaitFor('wait for prev button to be enabled', 'button[disabled!="disabled"]'),
          Chain.fromChains([
            UiFinder.cFindIn('button[title="Next"]'),
            Mouse.cClick
          ]),
          UiFinder.cFindIn('button[title="Next"]'),
          UiFinder.cWaitFor('wait for next button to be disabled', 'button[disabled="disabled"]'),
          Chain.fromChains([
            UiFinder.cFindIn('button[title="Previous"]'),
            Mouse.cClick,
            Mouse.cClick
          ]),
          UiFinder.cFindIn('button[title="Previous"]'),
          UiFinder.cWaitFor('wait for prev button to be disabled', 'button[disabled="disabled"]'),
          UiFinder.cFindIn('button[title="Next"]'),
          UiFinder.cWaitFor('wait for next button to be enabled', 'button[disabled!="disabled"]')
        ])
      ])
    ])
  , onSuccess, onFailure);
}, {
  plugins: 'searchreplace',
  toolbar: 'searchreplace',
  base_url: '/project/js/tinymce',
  theme: 'silver'
}, success, failure);
});
