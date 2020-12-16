import { Chain, Log, Logger, Mouse, Pipeline, Step, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';

import SearchreplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.searchreplace.UndoReplaceSpanTest', (success, failure) => {

  Theme();
  SearchreplacePlugin();

  const sUndo = (editor: Editor) => {
    return Logger.t('Undo', Step.sync(() => {
      editor.undoManager.undo();
    }));
  };

  const sRedo = (editor: Editor) => {
    return Logger.t('Redo', Step.sync(() => {
      editor.undoManager.redo();
    }));
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({},
      Log.steps('TBA', 'SearchReplace: replace one of three found, undo and redo and assert there is no matcher spans in editor', [
        tinyApis.sSetContent('<p>cats cats cats</p>'),
        tinyUi.sClickOnToolbar('click on searchreplace button', 'button[aria-label="Find and replace"]'),
        Chain.asStep({}, [
          Chain.fromParent(tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'), [
            Chain.fromChains([
              UiFinder.cFindIn('input.tox-textfield[placeholder="Find"]'),
              UiControls.cSetValue('cats')
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('input.tox-textfield[placeholder="Replace with"]'),
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
