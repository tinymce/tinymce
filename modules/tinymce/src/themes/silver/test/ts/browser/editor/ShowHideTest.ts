import { UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.ShowHideTest', () => {
  const base_url = '/project/tinymce/js/tinymce';

  before(() => {
    Theme();
  });

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

  it('TINY-6048: Inline editor should hide UI on editor hide', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ base_url, inline: true });
    // Bring out the UI
    editor.focus();
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
    editor.focus();
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
