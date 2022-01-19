import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.ReopenResizeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    indent: false,
    media_live_embeds: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const pWaitForResizeHandles = (editor: Editor) =>
    Waiter.pTryUntil('Wait for new width value', () => {
      UiFinder.exists(TinyDom.body(editor), '#mceResizeHandlenw');
    });

  const rawAssertImagePresence = (editor: Editor) => {
    // Hacky way to assert that the placeholder image is in
    // the correct place that works cross browser
    // assertContentStructure did not work because some
    // browsers insert BRs and some do not
    const images = editor.dom.select('img.mce-object');
    assert.lengthOf(images, 1, 'assert image is present');
  };

  it('TBA: Open dialog, set source value, assert width, close dialog. Reopen dialog, change width, close dialog and assert resize handles are present', async () => {
    const editor = hook.editor();
    await Utils.pOpenDialog(editor);
    await Utils.pPasteSourceValue(editor, 'a');
    await Utils.pAssertWidthValue(editor, '300');
    TinyUiActions.submitDialog(editor);

    await pWaitForResizeHandles(editor);
    await Utils.pOpenDialog(editor);
    await Utils.pChangeWidthValue(editor, '500');
    TinyUiActions.submitDialog(editor);

    await pWaitForResizeHandles(editor);
    await Waiter.pTryUntil(
      'Try assert content',
      () => rawAssertImagePresence(editor)
    );
  });
});
