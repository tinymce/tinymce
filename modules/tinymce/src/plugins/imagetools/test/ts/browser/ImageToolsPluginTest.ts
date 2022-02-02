import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import URI from 'tinymce/core/api/util/URI';
import Plugin from 'tinymce/plugins/imagetools/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as ImageUtils from '../module/test/ImageUtils';

describe('browser.tinymce.plugins.imagetools.ImageToolsPluginTest', () => {
  const browser = PlatformDetection.detect().browser;
  const uploadHandlerState = ImageUtils.createStateContainer();
  const srcUrl = '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.jpg';
  const bmpSrcUrl = '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.bmp';

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'imagetools',
    automatic_uploads: false,
    images_upload_handler: uploadHandlerState.handler(srcUrl),
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  // Some browsers can transform BMP images on the canvas, others can't. When that happens the image is converted to a PNG.
  // See https://html.spec.whatwg.org/multipage/canvas.html#serialising-bitmaps-to-a-file
  const expectedBmpFilename = browser.isChrome() || browser.isIE() || browser.isEdge() ? 'dogleft.png' : 'dogleft.bmp';

  const assertUploadFilename = (expected: string) => {
    const blobInfo = uploadHandlerState.get().blobInfo;
    assert.equal(blobInfo.filename(), expected, 'Should be expected file name');
  };

  const assertUploadFilenameMatches = (matchRegex: RegExp) => {
    const blobInfo = uploadHandlerState.get().blobInfo;
    assert.match(blobInfo.filename(), matchRegex, `File name ${blobInfo.filename()} should match ${matchRegex}`);
  };

  const assertUri = (expected: string) => {
    const blobInfo = uploadHandlerState.get().blobInfo;
    const uri = new URI(blobInfo.uri());
    assert.equal(uri.relative, expected, 'Should be expected uri');
  };

  beforeEach(() => uploadHandlerState.resetState());

  it('TBA: test generate filename', async () => {
    const editor = hook.editor();
    editor.settings.images_reuse_filename = false;
    await ImageUtils.pLoadImage(editor, srcUrl);
    TinySelections.select(editor, 'img', []);
    editor.execCommand('mceImageFlipHorizontal');
    await ImageUtils.pWaitForBlobImage(editor);
    await ImageUtils.pUploadImages(editor);
    await uploadHandlerState.pWaitForState();
    assertUploadFilenameMatches(/imagetools\d+\.jpg/);
  });

  it('TBA: test reuse filename', async () => {
    const editor = hook.editor();
    editor.settings.images_reuse_filename = true;
    await ImageUtils.pLoadImage(editor, srcUrl);
    TinySelections.select(editor, 'img', []);
    editor.execCommand('mceImageFlipHorizontal');
    await ImageUtils.pWaitForBlobImage(editor);
    await ImageUtils.pUploadImages(editor);
    await uploadHandlerState.pWaitForState();
    assertUploadFilename('dogleft.jpg');
    assertUri(srcUrl);
  });

  it('TINY-6642: test reuse filename with potentially converted format (bmp -> png)', async () => {
    const editor = hook.editor();
    editor.settings.images_reuse_filename = true;
    await ImageUtils.pLoadImage(editor, bmpSrcUrl);
    TinySelections.select(editor, 'img', []);
    editor.execCommand('mceImageFlipHorizontal');
    await ImageUtils.pWaitForBlobImage(editor);
    await ImageUtils.pUploadImages(editor);
    await uploadHandlerState.pWaitForState();
    assertUploadFilename(expectedBmpFilename);
  });

  it('TBA: test rotate image', async () => {
    const editor = hook.editor();
    await ImageUtils.pLoadImage(editor, srcUrl, { width: 200, height: 100 });
    TinySelections.select(editor, 'img', []);
    editor.execCommand('mceImageRotateRight');
    await ImageUtils.pWaitForBlobImage(editor);
    TinyAssertions.assertContentPresence(editor, {
      'img[width="100"][height="200"]': 1
    });
  });
});
