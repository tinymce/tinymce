import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

import { assertCleanHtml, fillActiveDialog } from '../../module/Helpers';

describe('browser.tinymce.plugins.image.plugin.MainTabTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true,
    image_list: [
      { title: 'link1', value: 'link1' },
      { title: 'link2', value: 'link2' }
    ],
    image_class_list: [
      { title: 'None', value: '' },
      { title: 'class1', value: 'class1' },
      { title: 'class2', value: 'class2' }
    ]
  }, [ Plugin ]);

  it('TBA: all image dialog ui options on empty editor', async () => {
    const editor = hook.editor();
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);

    fillActiveDialog({
      src: { value: 'src' },
      alt: 'alt',
      class: 'class1',
      dimensions: {
        width: '100',
        height: '200'
      },
      caption: true
    });
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, (
      '<figure class="image">' +
      '<img class="class1" src="src" alt="alt" width="100" height="200">' +
      '<figcaption>Caption</figcaption>' +
      '</figure>'
    ));
  });

  it('TINY-6400: render image_class_list and image_caption as Dialog type "grid"', async () => {
    const editor = hook.editor();
    editor.execCommand('mceImage');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    const expected = {
      ['.tox-form__grid--2col button[aria-label="Class"]']: 1,
      ['.tox-form__grid--2col .tox-checkbox']: 1
    };

    Assertions.assertPresence('Does have columns for the class and checkbox', expected, dialog);
    TinyUiActions.clickOnUi(editor, 'button.tox-button:contains(Cancel)');
  });

  it('TINY-6400: render image_class_list as Dialog type "panel"', async () => {
    const editor = hook.editor();
    editor.options.set('image_caption', false);
    editor.execCommand('mceImage');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    const expected = {
      ['.tox-form__group button[aria-label="Class"]']: 1,
      ['.tox-form__grid--2col .tox-checkbox']: 0
    };

    Assertions.assertPresence('Does not have columns for the class but a group', expected, dialog);
    TinyUiActions.clickOnUi(editor, 'button.tox-button:contains(Cancel)');
    editor.options.set('image_caption', true);
  });

  it('TINY-6400: render image_caption as Dialog type "panel"', async () => {
    const editor = hook.editor();
    editor.options.unset('image_class_list');

    editor.execCommand('mceImage');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    const expected = {
      ['.tox-form__grid--2col button[aria-label="Class"]']: 0,
      ['.tox-form__group .tox-checkbox']: 1,
    };

    Assertions.assertPresence('Does not have columns but a checkbox group', expected, dialog);
    TinyUiActions.clickOnUi(editor, 'button.tox-button:contains(Cancel)');
    editor.options.set('image_class_list', [
      { title: 'None', value: '' },
      { title: 'class1', value: 'class1' },
      { title: 'class2', value: 'class2' }
    ]);
  });
});
