import { Chain, FocusTools, Keyboard, Keys, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { ApiChains, Editor as McEditor } from '@ephox/mcagar';
import { SugarDocument, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.themes.silver.editor.toolbar.ToolbarFocusTest', (success, failure) => {
  SilverTheme();

  const cTestFocus = (label: string, settings: RawEditorSettings) => Chain.label(label, Chain.fromChains([
    McEditor.cFromSettings({
      toolbar: 'undo redo | bold italic',
      menubar: false,
      statusbar: false,
      ...settings,
      base_url: '/project/tinymce/js/tinymce'
    }),
    ApiChains.cFocus,
    Chain.runStepsOnValue((editor: Editor) => {
      const editorDoc = SugarElement.fromDom(editor.getDoc());
      const doc = SugarDocument.getDocument();

      return [
        // Press the Alt+F10 key
        Keyboard.sKeystroke(editorDoc, 121, { alt: true }),
        FocusTools.sTryOnSelector('Assert toolbar is focused', doc, 'div[role=toolbar] .tox-tbtn'),
        Keyboard.sKeystroke(doc, Keys.escape(), { }),
        FocusTools.sTryOnSelector('Assert editor is focused', doc, 'iframe'),
        FocusTools.sTryOnSelector('Assert editor is focused', editorDoc, 'body')
      ];
    }),
    McEditor.cRemove
  ]));

  Pipeline.async({}, [
    Log.chainsAsStep('TINY-6230', 'Pressing Alt+F10 focuses the toolbar and escape from the toolbar will focus the editor', [
      cTestFocus('Floating toolbar', { toolbar_mode: 'floating' }),
      cTestFocus('Sliding toolbar', { toolbar_mode: 'sliding' }),
      cTestFocus('Wrap toolbar', { toolbar_mode: 'wrap' }),
      cTestFocus('Multiple toolbars', { toolbar: [ 'undo redo', 'bold italic' ] })
    ])
  ], success, failure);
});
