import { FocusTools, Keyboard, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks } from '@ephox/mcagar';
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

  const pressTab = () => Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.tab(), { });
  const pressEsc = () => Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.escape(), { });
  const pressDown = () => Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.down(), { });

  const pAssertFocused = (name: string, selector: string) => FocusTools.pTryOnSelector(name, SugarDocument.getDocument(), selector);

  it('TBA: Insert Image Dialog basic cycle', async () => {
    const editor = hook.editor();
    editor.execCommand('mceImage');
    await pAssertFocused('Source', '.tox-textfield');
    pressTab();
    await pAssertFocused('Description', '.tox-textfield');
    pressTab();
    await pAssertFocused('Width', '.tox-textfield');
    pressTab();
    await pAssertFocused('Height', '.tox-textfield');
    pressTab();
    await pAssertFocused('Constraint proportions', 'button.tox-lock');
    pressTab();
    await pAssertFocused('Cancel', 'button.tox-button:contains("Cancel")');
    pressTab();
    await pAssertFocused('Save', 'button.tox-button:contains("Save")');
    pressEsc();
  });

  it('TBA: Insert Image Dialog with filepicker cycle', async () => {
    const editor = hook.editor();
    editor.settings.image_advtab = true;
    editor.execCommand('mceImage');
    await pAssertFocused('General tab', '.tox-dialog__body-nav-item:contains("General")');
    pressTab();
    await pAssertFocused('Source', '.tox-textfield');
    pressTab();
    await pAssertFocused('Description', '.tox-textfield');
    pressTab();
    await pAssertFocused('Width', '.tox-textfield');
    pressTab();
    await pAssertFocused('Height', '.tox-textfield');
    pressTab();
    await pAssertFocused('Constraint proportions', 'button.tox-lock');
    pressTab();
    await pAssertFocused('Cancel', 'button.tox-button:contains("Cancel")');
    pressTab();
    await pAssertFocused('Save', 'button.tox-button:contains("Save")');
    pressEsc();
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
    pressTab();
    await pAssertFocused('Source', '.tox-textfield');
    pressTab();
    await pAssertFocused('Source button', '.tox-browse-url');
    pressTab();
    await pAssertFocused('Image list', '.tox-listbox');
    pressTab();
    await pAssertFocused('Description', '.tox-textfield');
    pressTab();
    await pAssertFocused('Width', '.tox-textfield');
    pressTab();
    await pAssertFocused('Height', '.tox-textfield');
    pressTab();
    await pAssertFocused('Constraint proportions', 'button.tox-lock');
    pressTab();
    await pAssertFocused('Class', '.tox-listbox');
    pressTab();
    await pAssertFocused('Caption', 'input.tox-checkbox__input');
    pressTab();
    await pAssertFocused('Cancel', 'button.tox-button:contains("Cancel")');
    pressTab();
    await pAssertFocused('Save', 'button.tox-button:contains("Save")');
    pressEsc();
  });

  it('TBA: Insert Image Dialog with advanced tab', async () => {
    const editor = hook.editor();
    editor.settings.image_advtab = true;
    editor.execCommand('mceImage');
    await pAssertFocused('General tab', '.tox-dialog__body-nav-item:contains("General")');
    pressDown();
    await pAssertFocused('Advanced tab', '.tox-dialog__body-nav-item:contains("Advanced")');
    pressTab();
    await pAssertFocused('Style', '.tox-textfield');
    pressTab();
    await pAssertFocused('Vertical space', '.tox-textfield');
    pressTab();
    await pAssertFocused('Horizontal space', '.tox-textfield');
    pressTab();
    await pAssertFocused('Border width', '.tox-textfield');
    pressTab();
    await pAssertFocused('Border style', '.tox-listbox');
    pressTab();
    await pAssertFocused('Cancel', 'button.tox-button:contains("Cancel")');
    pressTab();
    await pAssertFocused('Save', 'button.tox-button:contains("Save")');
    pressEsc();
  });

  it('TBA: Insert Image Dialog with upload tab', async () => {
    const editor = hook.editor();
    editor.settings.image_advtab = true;
    editor.settings.images_upload_url = '/custom/imageUpload';
    editor.execCommand('mceImage');
    await pAssertFocused('General tab', '.tox-dialog__body-nav-item:contains("General")');
    pressDown();
    await pAssertFocused('Advanced tab', '.tox-dialog__body-nav-item:contains("Advanced")');
    pressDown();
    await pAssertFocused('Upload tab', '.tox-dialog__body-nav-item:contains("Upload")');
    pressTab();
    await pAssertFocused('Browse for an image', '.tox-dropzone button.tox-button');
    pressTab();
    await pAssertFocused('Cancel', 'button.tox-button:contains("Cancel")');
    pressTab();
    await pAssertFocused('Save', 'button.tox-button:contains("Save")');
    pressEsc();
  });
});
