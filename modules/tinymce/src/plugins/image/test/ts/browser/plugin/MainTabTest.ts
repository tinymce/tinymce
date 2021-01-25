import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

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
  }, [ Plugin, Theme ]);

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
      '<img class="class1" src="src" alt="alt" width="100" height="200" />' +
      '<figcaption>Caption</figcaption>' +
      '</figure>'
    ));
  });
});
