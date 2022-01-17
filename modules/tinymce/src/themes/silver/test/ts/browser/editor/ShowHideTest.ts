import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as UiUtils from '../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.ShowHideTest', () => {
  const base_url = '/project/tinymce/js/tinymce';

  const pWaitForVisible = (label: string, selector: string) => UiFinder.pWaitForVisible(label, SugarBody.body(), selector);
  const pWaitForHidden = (label: string, selector: string) => UiFinder.pWaitForHidden(label, SugarBody.body(), selector);

  const openDialog = (editor: Editor) => editor.windowManager.open({
    title: 'Dummy dialog',
    body: {
      type: 'panel',
      items: [
        {
          type: 'htmlpanel',
          html: 'Lorem ipsum'
        }
      ]
    },
    buttons: [
      {
        type: 'submit',
        text: 'Ok'
      }
    ]
  });

  const pActivateEditor = async (editor: Editor) => {
    editor.focus();
    await UiUtils.pWaitForEditorToRender();
  };

  it('TINY-6048: Inline editor should hide UI on editor hide', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ base_url, inline: true });
    // Bring out the UI
    await pActivateEditor(editor);
    await pWaitForVisible('UI should be on the screen', '.tox-toolbar');
    // Hide the editor
    editor.hide();
    await pWaitForHidden('UI should not be on the screen', '.tox-toolbar');
    // Bring the editor back
    editor.show();
    await pWaitForVisible('UI should be back on the screen', '.tox-toolbar');
    McEditor.remove(editor);
  });

  it('TINY-6048: Iframe editor should hide UI on editor hide', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ base_url });
    await pWaitForVisible('UI should be on the screen', '.tox-toolbar');
    editor.hide();
    await pWaitForHidden('UI should not be on the screen', '.tox-toolbar');
    editor.show();
    await pWaitForVisible('UI should be back on the screen', '.tox-toolbar');
    McEditor.remove(editor);
  });

  it('TINY-6048: Inline editor should close dialogs on editor hide', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ base_url, inline: true });
    // Bring out the UI
    await pActivateEditor(editor);
    openDialog(editor);
    await pWaitForVisible('Dialog should be on the screen', '.tox-dialog');
    // Hide the editor
    editor.hide();
    await pWaitForHidden('Dialog should not be on the screen', '.tox-dialog');
    // Bring the editor back
    editor.show();
    await pWaitForVisible('Dialog should be back on the screen', '.tox-dialog');
    McEditor.remove(editor);
  });

  it('TINY-6048: Iframe editor should close dialogs on editor hide', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ base_url });
    // Bring out the UI
    openDialog(editor);
    await pWaitForVisible('Dialog should be on the screen', '.tox-dialog');
    // Hide the editor
    editor.hide();
    await pWaitForHidden('Dialog should not be on the screen', '.tox-dialog');
    // Bring the editor back
    editor.show();
    await pWaitForVisible('Dialog should be back on the screen', '.tox-dialog');
    McEditor.remove(editor);
  });
});
