import {
    Chain, GeneralSteps, Logger, Mouse, Pipeline, Step, UiControls, UiFinder
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import SearchreplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.searchreplace.UndoReplaceSpanTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  SearchreplacePlugin();

  const sUndo = function (editor) {
    return Step.sync(function () {
      editor.undoManager.undo();
    });
  };

  const sRedo = function (editor) {
    return Step.sync(function () {
      editor.undoManager.redo();
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('replace on of three found, undo and redo and there be no matcher spans in editor', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>cats cats cats</p>'),
        tinyUi.sClickOnToolbar('click on searchreplace button', 'div[aria-label="Find and replace"] button'),
        Chain.asStep({}, [
          Chain.fromParent(tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'), [
            Chain.fromChains([
              UiFinder.cFindIn('label:contains("Find") + input'),
              UiControls.cSetValue('cats')
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('label:contains("Replace with") + input'),
              UiControls.cSetValue('dogs')
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('button:contains("Find")'),
              Mouse.cClick
            ]),
            Chain.fromChains([
              UiFinder.cWaitFor('wait for button to be enabled', 'div[aria-disabled="false"] span:contains("Replace")')
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('button:contains("Replace")'),
              Mouse.cClick
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('button.mce-close'),
              Mouse.cClick
            ])
          ])
        ]),
        sUndo(editor),
        tinyApis.sAssertContent('<p>cats cats cats</p>'),
        sRedo(editor),
        tinyApis.sAssertContentPresence({ 'span.mce-match-marker': 0 }),
        tinyApis.sAssertContent('<p>dogs cats cats</p>')
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'searchreplace',
    toolbar: 'searchreplace',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
