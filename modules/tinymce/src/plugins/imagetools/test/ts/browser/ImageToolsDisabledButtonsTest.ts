import { UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyDom, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
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

  before(() => {
    Theme();
    ImageToolsPlugin();
    ImagePlugin();
  });

  const assertButtonsStatus = (editor: Editor, spec: { disabled: boolean }) => {
    const container = TinyDom.container(editor);
    UiFinder.exists(container, `${editImageButtonSelector}[aria-disabled="${spec.disabled}"]`);
    UiFinder.exists(container, `${flipHorizontallyImageButtonSelector}[aria-disabled="${spec.disabled}"]`);
    UiFinder.exists(container, `${flipVerticallyImageButtonSelector}[aria-disabled="${spec.disabled}"]`);
    UiFinder.exists(container, `${rotateCounterClockwiseImageButtonSelector}[aria-disabled="${spec.disabled}"]`);
    UiFinder.exists(container, `${rotateClockwiseImageButtonSelector}[aria-disabled="${spec.disabled}"]`);
  };

  const insertRemoteImage = (editor: Editor) => {
    const remoteImageSrc = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
    editor.setContent(`<p><img src="${remoteImageSrc}" width="50" height="50" /></p>`);
  };

  it('TINY-7772: Edit, flip and rotate should be disabled for remote images without imagetools_proxy set', async () => {
    const editor = await McEditor.pFromSettings<Editor>(settings);
    insertRemoteImage(editor);
    TinySelections.select(editor, 'img', []);

    assertButtonsStatus(editor, { disabled: true });
    McEditor.remove(editor);
  });

  it('TINY-7772: Edit, flip and rotate should be enabled for remote images with imagetools_proxy set', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ ...settings, imagetools_proxy: 'foo.php' });
    insertRemoteImage(editor);
    TinySelections.select(editor, 'img', []);
    await UiFinder.pWaitFor('Wait for edit image button to became enabled', TinyDom.container(editor), `${editImageButtonSelector}[aria-disabled="false"]`);

    assertButtonsStatus(editor, { disabled: false });
    McEditor.remove(editor);
  });

  it('TINY-7772: Edit, flip and rotate should be disabled when no images are selected', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ ...settings, imagetools_proxy: 'foo.php' });
    insertRemoteImage(editor);

    assertButtonsStatus(editor, { disabled: true });
    McEditor.remove(editor);
  });
});
