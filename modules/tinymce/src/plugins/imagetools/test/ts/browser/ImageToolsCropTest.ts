import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions } from '@ephox/mcagar';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/imagetools/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { ImageOps } from '../module/test/ImageOps';
import * as ImageUtils from '../module/test/ImageUtils';

describe('browser.tinymce.plugins.imagetools.ImageToolsCropTest', () => {
  const uploadHandlerState = ImageUtils.createStateContainer();
  const srcUrl = '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.jpg';

  Arr.each([
    { label: 'Iframe Editor', setup: TinyHooks.bddSetupLight },
    { label: 'Shadow Dom Editor', setup: TinyHooks.bddSetupInShadowRoot }
  ], (tester) => {
    context(tester.label, () => {
      const hook = tester.setup<Editor>({
        plugins: 'imagetools',
        toolbar: 'editimage',
        automatic_uploads: false,
        images_upload_handler: uploadHandlerState.handler(srcUrl),
        base_url: '/project/tinymce/js/tinymce'
      }, [ Plugin, Theme ]);

      beforeEach(() => uploadHandlerState.resetState());

      it('TINY-6387: Images can be cropped', async () => {
        const editor = hook.editor();
        await ImageUtils.pLoadImage(editor, srcUrl);
        TinySelections.select(editor, 'img', []);
        await ImageOps.pExecDialog(editor, 'Crop');
        await ImageUtils.pWaitForBlobImage(editor);
        TinyAssertions.assertContentPresence(editor, {
          'img[height=528]': 1,
          'img[width=728]': 1
        });
      });
    });
  });
});
