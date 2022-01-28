import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.UpdateMediaPosterAttributeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const source = 'http://test.se';
  const poster1 = 'https://www.google.com/logos/google.jpg';
  const poster2 = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Facebook_icon.jpg';

  const pOpenAdvTab = async (editor: Editor) => {
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.clickOnUi(editor, 'div.tox-tab:contains(Advanced)');
  };

  it('TBA: Assert embed data of the video after updating dimensions and media poster value', async () => {
    const editor = hook.editor();
    await Utils.pOpenDialog(editor);
    await Utils.pPasteSourceValue(editor, source);
    await Utils.pAssertHeightAndWidth(editor, '150', '300');
    await Utils.pChangeWidthValue(editor, '350');
    await Utils.pChangeHeightValue(editor, '100');
    await Utils.pAssertHeightAndWidth(editor, '100', '200');
    await pOpenAdvTab(editor);
    await Utils.pPastePosterValue(editor, poster1);
    await Utils.pAssertEmbedData(editor,
      `<video poster="${poster1}" controls="controls" width="200" height="100">\n` +
      `<source src="${source}">\n</video>`
    );
    TinyUiActions.submitDialog(editor);

    TinySelections.select(editor, 'span.mce-preview-object', []);
    await Utils.pOpenDialog(editor);
    await pOpenAdvTab(editor);
    await Utils.pPastePosterValue(editor, poster2);
    await Utils.pAssertEmbedData(editor,
      `<video poster="${poster2}" controls="controls" width="200" height="100">\n` +
      `<source src="${source}"></video>`
    );
    TinyUiActions.submitDialog(editor);
  });
});
