import { UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyDom, TinySelections } from '@ephox/mcagar';
import { Attribute, SugarBody } from '@ephox/sugar';
import { assert } from 'chai';

import PromisePolyfill from 'tinymce/core/api/util/Promise';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import ImageToolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.imagetools.ImageToolsDisabledButtonsTest', () => {

  const settings = {
    plugins: 'image imagetools',
    toolbar: 'editimage fliph flipv rotateleft rotateright',
    base_url: '/project/tinymce/js/tinymce',
    height: 900
  };

  const editImageButtonSelector = '[role="toolbar"] button[title="Edit image"]';
  const flipHorizontallyImageButtonSelector = '[role="toolbar"] button[title="Flip horizontally"]';
  const flipVerticallyImageButtonSelector = '[role="toolbar"] button[title="Flip vertically"]';
  const rotateCounterClockwiseImageButtonSelector = '[role="toolbar"] button[title="Rotate counterclockwise"]';
  const rotateClockwiseImageButtonSelector = '[role="toolbar"] button[title="Rotate clockwise"]';

  const assertImageToolsButtonsExist = (editor) => {
    UiFinder.exists(TinyDom.container(editor), editImageButtonSelector);
    UiFinder.exists(TinyDom.container(editor), flipHorizontallyImageButtonSelector);
    UiFinder.exists(TinyDom.container(editor), flipVerticallyImageButtonSelector);
    UiFinder.exists(TinyDom.container(editor), rotateCounterClockwiseImageButtonSelector);
    UiFinder.exists(TinyDom.container(editor), rotateClockwiseImageButtonSelector);
  };

  const assertButtonStatus = (editor, selector: string, enabled: boolean) => {
    UiFinder.findIn(TinyDom.container(editor), selector).map((button) => {
      assert.equal(Attribute.get(button, 'aria-disabled'), Boolean(enabled).toString());
    });
  };

  const pLoadRemoteImage = (editor): Promise<void> => {
    return new PromisePolyfill((resolve, reject) => {
      const remoteImageSrc = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
      const img = new Image();
      img.src = remoteImageSrc;

      img.onload = () => {
        editor.setContent(`<p><img src="${remoteImageSrc}" width="50" height="50" /></p>`);
        editor.focus();
        resolve();
      };

      img.onerror = (e) => reject(e);
    });
  };

  const pWaitImageToolsContextMenu = () =>
    Waiter.pTryUntil('Wait for Image Tools context menu to open', () => UiFinder.exists(SugarBody.body(), '.tox-pop'));

  before(() => {
    Theme();
    ImageToolsPlugin();
    ImagePlugin();
  });

  it('TINY-7772: Edit, flip and rotate should be disabled for remote images without imagetools_proxy set', async () => {
    try {
      const editor = await McEditor.pFromSettings(settings);
      await pLoadRemoteImage(editor);
      TinySelections.select(editor, 'img', []);

      assertImageToolsButtonsExist(editor);
      const enabled = true;
      assertButtonStatus(editor, editImageButtonSelector, enabled);
      assertButtonStatus(editor, flipHorizontallyImageButtonSelector, enabled);
      assertButtonStatus(editor, flipVerticallyImageButtonSelector, enabled);
      assertButtonStatus(editor, rotateCounterClockwiseImageButtonSelector, enabled);
      assertButtonStatus(editor, rotateClockwiseImageButtonSelector, enabled);
      McEditor.remove(editor);
    } catch (e) {
      assert.fail(`Test failed: ${e.message}`);
    }
  });

  it('TINY-7772: Edit, flip and rotate should be enabled for remote images with imagetools_proxy set', async () => {
    try {
      const editor = await McEditor.pFromSettings({ ...settings, imagetools_proxy: 'foo.php' });
      await pLoadRemoteImage(editor);
      TinySelections.select(editor, 'img', []);
      await pWaitImageToolsContextMenu();

      assertImageToolsButtonsExist(editor);
      const enabled = false;
      assertButtonStatus(editor, editImageButtonSelector, enabled);
      assertButtonStatus(editor, flipHorizontallyImageButtonSelector, enabled);
      assertButtonStatus(editor, flipVerticallyImageButtonSelector, enabled);
      assertButtonStatus(editor, rotateCounterClockwiseImageButtonSelector, enabled);
      assertButtonStatus(editor, rotateClockwiseImageButtonSelector, enabled);
      McEditor.remove(editor);
    } catch (e) {
      assert.fail(`Test failed: ${e.message}`);
    }
  });
});
