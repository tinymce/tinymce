import { Chain, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor, UiChains } from '@ephox/mcagar';
import { SugarElement, SugarBody, Insert, Focus, Remove, Visibility } from '@ephox/sugar';
import { Fun } from '@ephox/katamari';
import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.themes.silver.editor.ToolbarPersistTest', (success, failure) => {
  Theme();

  const cWaitForHidden = UiChains.cWaitForState(Fun.not(Visibility.isVisible));

  const cShowEditorUi = Chain.op((editor: Editor) => editor.ui.show());
  const cHideEditorUi = Chain.op((editor: Editor) => editor.ui.hide());

  const cFocusEditor = Chain.op((editor: Editor) => {
    editor.focus();
    editor.nodeChanged();
  });

  const cUnfocusEditor = Chain.op((_) => {
    const div = SugarElement.fromTag('input');
    Insert.append(SugarBody.body(), div);
    Focus.focus(div);
    Remove.remove(div);
  });

  Pipeline.async({}, [
    Log.chainsAsStep('TINY-4847', 'Test toolbar_persist. Focus & unfocus should not affect toolbar visibility', [
      McEditor.cFromSettings({
        theme: 'silver',
        inline: true,
        base_url: '/project/tinymce/js/tinymce',
        toolbar_persist: true
      }),

      UiChains.cWaitForPopup('Wait for editor to be visible', '.tox-tinymce-inline'),
      cUnfocusEditor,
      Chain.wait(200), // Need to wait since nothing should happen.
      UiChains.cWaitForPopup('Wait for editor to be visible', '.tox-tinymce-inline'),

      cHideEditorUi,

      cWaitForHidden('Wait for editor to be hidden', '.tox-tinymce-inline'),
      cFocusEditor,
      Chain.wait(200), // Need to wait since nothing should happen.
      cWaitForHidden('Wait for editor to be hidden', '.tox-tinymce-inline'),

      cShowEditorUi,
      UiChains.cWaitForPopup('Wait for editor to be visible', '.tox-tinymce-inline'),

      McEditor.cRemove
    ])
  ], success, failure);
});
