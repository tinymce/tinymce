import { FocusTools, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarDocument } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.image.DialogTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const pressTab = (editor: Editor) => TinyUiActions.keydown(editor, Keys.tab());
  const pressEsc = (editor: Editor) => TinyUiActions.keydown(editor, Keys.escape());
  const pressDown = (editor: Editor) => TinyUiActions.keydown(editor, Keys.down());

  const pAssertFocused = (name: string, selector: string) => FocusTools.pTryOnSelector(name, SugarDocument.getDocument(), selector);

  it('TBA: Insert Image Dialog basic cycle', async () => {
    const editor = hook.editor();
    editor.execCommand('mceImage');
    await pAssertFocused('Source', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Description', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Width', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Height', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Constraint proportions', 'button.tox-lock');
    pressTab(editor);
    await pAssertFocused('Cancel', 'button.tox-button:contains("Cancel")');
    pressTab(editor);
    await pAssertFocused('Save', 'button.tox-button:contains("Save")');
    pressEsc(editor);
  });

  it('TBA: Insert Image Dialog with filepicker cycle', async () => {
    const editor = hook.editor();
    editor.settings.image_advtab = true;
    editor.execCommand('mceImage');
    await pAssertFocused('General tab', '.tox-dialog__body-nav-item:contains("General")');
    pressTab(editor);
    await pAssertFocused('Source', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Description', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Width', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Height', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Constraint proportions', 'button.tox-lock');
    pressTab(editor);
    await pAssertFocused('Cancel', 'button.tox-button:contains("Cancel")');
    pressTab(editor);
    await pAssertFocused('Save', 'button.tox-button:contains("Save")');
    pressEsc(editor);
  });

  it('TBA: Insert Image Dialog with all options', async () => {
    const editor = hook.editor();
    editor.settings.file_picker_callback = Fun.noop;
    editor.settings.image_advtab = true;
    editor.settings.image_class_list = [{ title: 'sample', value: 'sample' }];
    editor.settings.image_list = [{ title: 'sample', value: 'sample' }];
    editor.settings.image_caption = true;
    editor.execCommand('mceImage');
    await pAssertFocused('General tab', '.tox-dialog__body-nav-item:contains("General")');
    pressTab(editor);
    await pAssertFocused('Source', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Source button', '.tox-browse-url');
    pressTab(editor);
    await pAssertFocused('Image list', '.tox-listbox');
    pressTab(editor);
    await pAssertFocused('Description', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Width', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Height', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Constraint proportions', 'button.tox-lock');
    pressTab(editor);
    await pAssertFocused('Class', '.tox-listbox');
    pressTab(editor);
    await pAssertFocused('Caption', 'input.tox-checkbox__input');
    pressTab(editor);
    await pAssertFocused('Cancel', 'button.tox-button:contains("Cancel")');
    pressTab(editor);
    await pAssertFocused('Save', 'button.tox-button:contains("Save")');
    pressEsc(editor);
  });

  it('TBA: Insert Image Dialog with advanced tab', async () => {
    const editor = hook.editor();
    editor.settings.image_advtab = true;
    editor.execCommand('mceImage');
    await pAssertFocused('General tab', '.tox-dialog__body-nav-item:contains("General")');
    pressDown(editor);
    await pAssertFocused('Advanced tab', '.tox-dialog__body-nav-item:contains("Advanced")');
    pressTab(editor);
    await pAssertFocused('Style', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Vertical space', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Horizontal space', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Border width', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Border style', '.tox-listbox');
    pressTab(editor);
    await pAssertFocused('Cancel', 'button.tox-button:contains("Cancel")');
    pressTab(editor);
    await pAssertFocused('Save', 'button.tox-button:contains("Save")');
    pressEsc(editor);
  });

  it('TBA: Insert Image Dialog with upload tab', async () => {
    const editor = hook.editor();
    editor.settings.image_advtab = true;
    editor.settings.images_upload_url = '/custom/imageUpload';
    editor.execCommand('mceImage');
    await pAssertFocused('General tab', '.tox-dialog__body-nav-item:contains("General")');
    pressDown(editor);
    await pAssertFocused('Advanced tab', '.tox-dialog__body-nav-item:contains("Advanced")');
    pressDown(editor);
    await pAssertFocused('Upload tab', '.tox-dialog__body-nav-item:contains("Upload")');
    pressTab(editor);
    await pAssertFocused('Browse for an image', '.tox-dropzone button.tox-button');
    pressTab(editor);
    await pAssertFocused('Cancel', 'button.tox-button:contains("Cancel")');
    pressTab(editor);
    await pAssertFocused('Save', 'button.tox-button:contains("Save")');
    pressEsc(editor);
  });
});
