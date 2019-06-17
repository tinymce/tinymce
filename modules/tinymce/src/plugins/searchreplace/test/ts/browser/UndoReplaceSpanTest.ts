import {
    Chain, Log, Mouse, Pipeline, Step, UiControls, UiFinder, Logger
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import SearchreplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.searchreplace.UndoReplaceSpanTest', (success, failure) => {

  Theme();
  SearchreplacePlugin();

  const sUndo = function (editor) {
    return Logger.t('Undo', Step.sync(function () {
      editor.undoManager.undo();
    }));
  };

  const sRedo = function (editor) {
    return Logger.t('Redo', Step.sync(function () {
      editor.undoManager.redo();
    }));
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({},
      Log.steps('TBA', 'SearchReplace: replace one of three found, undo and redo and assert there is no matcher spans in editor', [
        tinyApis.sSetContent('<p>cats cats cats</p>'),
        tinyUi.sClickOnToolbar('click on searchreplace button', 'button[aria-label="Find and replace"]'),
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
              UiFinder.cWaitFor('wait for button to be enabled', 'button[disabled!="disabled"]:contains("Replace")')
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('button:contains("Replace")'),
              Mouse.cClick
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('button[aria-label="Close"]'),
              Mouse.cClick
            ])
          ])
        ]),
        sUndo(editor),
        tinyApis.sAssertContent('<p>cats cats cats</p>'),
        sRedo(editor),
        tinyApis.sAssertContentPresence({ 'span.mce-match-marker': 0 }),
        tinyApis.sAssertContent('<p>dogs cats cats</p>')
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'searchreplace',
    toolbar: 'searchreplace',
    base_url: '/project/tinymce/js/tinymce',
    theme: 'silver'
  }, success, failure);
});
