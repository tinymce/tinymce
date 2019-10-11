import { Chain, Log, Mouse, NamedChain, Pipeline, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import SearchreplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.searchreplace.SearchReplacePrevNextTest', (success, failure) => {

Theme();
SearchreplacePlugin();

TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
  const tinyApis = TinyApis(editor);
  const tinyUi = TinyUi(editor);

  const cAssertButtonsEnabled = NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), UiFinder.cWaitFor('wait for next button to be enabled', 'button[title="Next"]:not([disabled])'), '_'),
    NamedChain.direct(NamedChain.inputName(), UiFinder.cWaitFor('wait for prev button to be enabled', 'button[title="Previous"]:not([disabled])'), '_'),
    NamedChain.direct(NamedChain.inputName(), UiFinder.cWaitFor('wait for replace button to be enabled', 'button[title="Replace"]:not([disabled])'), '_'),
    NamedChain.outputInput
  ]);

  const cAssertNextPrevButtonsDisabled = NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), UiFinder.cWaitFor('wait for next button to be disabled', 'button[title="Next"][disabled]'), '_'),
    NamedChain.direct(NamedChain.inputName(), UiFinder.cWaitFor('wait for prev button to be disabled', 'button[title="Previous"][disabled]'), '_'),
    NamedChain.outputInput
  ]);

  const cClickButton = (name: string) => Chain.fromChains([
    UiFinder.cFindIn('button[title="' + name + '"]:not([disabled])'),
    Mouse.cClick
  ]);

  Pipeline.async({},
    Log.steps('TBA', 'SearchReplace: Test Prev and Next buttons become enabled and disabled at right places when multiple matches exist', [
      tinyApis.sSetContent('<p>fish fish fish</p>'),
      Utils.sOpenDialog(tinyUi),
      Chain.asStep({}, [
        Chain.fromParent(tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'), [
          Chain.fromChains([
            UiFinder.cFindIn('input.tox-textfield[placeholder="Find"]'),
            UiControls.cSetValue('fish')
          ]),
          cClickButton('Find'),

          // Initial button states for first match
          cAssertButtonsEnabled,

          // Click next and assert states for second match
          cClickButton('Next'),
          cAssertButtonsEnabled,

          // Click next and assert states for third/final match
          cClickButton('Next'),
          cAssertButtonsEnabled,

          // Click next and cycle back to first match
          cClickButton('Next'),
          cAssertButtonsEnabled,

          // replace all but one value and assert next/previous are disabled
          Chain.fromChains([
            UiFinder.cFindIn('input.tox-textfield[placeholder="Replace with"]'),
            UiControls.cSetValue('squid')
          ]),
          cClickButton('Replace'),
          cAssertButtonsEnabled,
          cClickButton('Replace'),
          cAssertNextPrevButtonsDisabled,

          // Ensure the replace button is still enabled, for the last match
          UiFinder.cWaitFor('wait for replace button to be enabled', 'button[title="Replace"]:not([disabled])')
        ])
      ]),
      tinyApis.sAssertContent('<p>squid squid fish</p>')
    ])
  , onSuccess, onFailure);
}, {
  plugins: 'searchreplace',
  toolbar: 'searchreplace',
  base_url: '/project/tinymce/js/tinymce',
  theme: 'silver'
}, success, failure);
});
