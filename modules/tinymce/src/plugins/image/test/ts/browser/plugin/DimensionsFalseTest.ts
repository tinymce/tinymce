import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { assertCleanHtml, fillActiveDialog, pWaitForDialog, submitDialog } from '../../module/Helpers';

describe('browser.tinymce.plugins.image.plugin.DimensionsFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_dimensions: false
  }, [ Plugin, Theme ]);

  it('TBA: image dialog image_dimensions: false', async () => {
    const editor = hook.editor();
    editor.execCommand('mceImage');
    await pWaitForDialog(editor);

    fillActiveDialog({
      src: {
        value: 'src'
      },
      alt: 'alt'
    });
    submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="src" alt="alt" /></p>');
  });
});
