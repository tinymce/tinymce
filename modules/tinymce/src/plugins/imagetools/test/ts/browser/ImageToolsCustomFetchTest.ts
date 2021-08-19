import { describe, it } from '@ephox/bedrock-client';
import { BlobConversions } from '@ephox/imagetools';
import { Singleton } from '@ephox/katamari';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import PromisePolyfill from 'tinymce/core/api/util/Promise';
import Plugin from 'tinymce/plugins/imagetools/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as ImageUtils from '../module/test/ImageUtils';

describe('browser.tinymce.plugins.imagetools.ImageToolsCustomFetchTest', () => {
  const uploadHandlerState = ImageUtils.createStateContainer();
  const srcUrl = '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.jpg';
  const fetchState = Singleton.value<string>();

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'imagetools',
    automatic_uploads: false,
    images_upload_handler: uploadHandlerState.handler(srcUrl),
    imagetools_cors_hosts: [ 'localhost' ],
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  it('TBA: flip image with custom fetch image', async () => {
    const editor = hook.editor();
    editor.settings.imagetools_fetch_image = (img: HTMLImageElement) => {
      fetchState.set(img.src);
      return BlobConversions.imageToBlob(img);
    };
    await ImageUtils.pLoadImage(editor, srcUrl);
    TinySelections.select(editor, 'img', []);
    editor.execCommand('mceImageFlipHorizontal');
    await ImageUtils.pWaitForBlobImage(editor);

    const actualSrc = fetchState.get().getOrDie('Could not get fetch state');
    const expectedSrc = document.location.protocol + '//' + document.location.host + '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.jpg';
    assert.equal(actualSrc, expectedSrc, 'Should be the expected input image');
  });

  it('TBA: flip image with custom fetch image that returns an error', async () => {
    const editor = hook.editor();
    editor.settings.imagetools_fetch_image = () => PromisePolyfill.reject('Custom fail');
    await ImageUtils.pLoadImage(editor, srcUrl);
    TinySelections.select(editor, 'img', []);
    editor.execCommand('mceImageFlipHorizontal');
    await TinyUiActions.pWaitForUi(editor, '.tox-notification__body:contains("Custom fail")');
  });
});
