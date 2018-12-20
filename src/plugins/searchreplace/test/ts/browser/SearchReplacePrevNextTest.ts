import { Chain, Log, Mouse, Pipeline, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import SearchreplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.searchreplace.SearchReplacePrevNextTest', (success, failure) => {

Theme();
SearchreplacePlugin();

TinyLoader.setup(function (editor, onSuccess, onFailure) {
  const tinyApis = TinyApis(editor);
  const tinyUi = TinyUi(editor);

  Pipeline.async({},
    Log.steps('TBA', 'SearchReplace: Test Prev and Next buttons become enabled and disabled at right places when multiple matches exist', [
      tinyApis.sSetContent('<p>fish fish fish</p>'),
      tinyUi.sClickOnToolbar('click on searchreplace button', 'button[aria-label="Find and replace..."]'),
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
          UiFinder.cWaitFor('wait for next button to be enabled', 'button[disabled!="disabled"]:contains("Next")'),
          Chain.fromChains([
            UiFinder.cFindIn('button:contains("Next")'),
            Mouse.cClick
          ]),
          UiFinder.cWaitFor('wait for prev button to be enabled', 'button[disabled!="disabled"]:contains("Previous")'),
          Chain.fromChains([
            UiFinder.cFindIn('button:contains("Next")'),
            Mouse.cClick
          ]),
          UiFinder.cWaitFor('wait for next button to be disabled', 'button[disabled="disabled"]:contains("Next")'),
          Chain.fromChains([
            UiFinder.cFindIn('button:contains("Previous")'),
            Mouse.cClick,
            Mouse.cClick
          ]),
          UiFinder.cWaitFor('wait for prev button to be disabled', 'button[disabled="disabled"]:contains("Previous")'),
          UiFinder.cWaitFor('wait for next button to be enabled', 'button[disabled!="disabled"]:contains("Next")')
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
