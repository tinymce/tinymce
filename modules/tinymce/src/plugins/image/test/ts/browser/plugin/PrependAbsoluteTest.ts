import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

import { assertCleanHtml, fakeEvent, fillActiveDialog, generalTabSelectors } from '../../module/Helpers';

describe('browser.tinymce.plugins.image.plugin.PrependAbsoluteTest', () => {
  const prependUrl = 'http://abc.local/images/';
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_prepend_url: prependUrl
  }, [ Plugin ]);

  it('TBA: image recognizes relative src url and prepends absolute image_prepend_url setting.', async () => {
    const editor = hook.editor();
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);

    fillActiveDialog({
      src: {
        value: 'src'
      },
      alt: 'alt'
    });
    const srcElem = UiFinder.findIn(SugarBody.body(), generalTabSelectors.src).getOrDie();
    fakeEvent(srcElem, 'change');
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="' + prependUrl + 'src" alt="alt"></p>');
  });
});
