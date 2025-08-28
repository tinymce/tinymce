import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.NoAdvancedTabTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: if alt source and poster set to false, do not show advanced tab', async () => {
    const editor = hook.editor();
    editor.options.set('media_alt_source', false);
    editor.options.set('media_poster', false);
    const dialog = await Utils.pOpenDialog(editor);
    UiFinder.notExists(dialog, 'div.tox-tab:contains(Advanced)');
    TinyUiActions.closeDialog(editor);
  });

  it('TBA: if alt source and poster not set to false, show advanced tab', async () => {
    const editor = hook.editor();
    editor.options.unset('media_alt_source');
    editor.options.unset('media_poster');
    const dialog = await Utils.pOpenDialog(editor);
    UiFinder.exists(dialog, 'div.tox-tab:contains(Advanced)');
    TinyUiActions.closeDialog(editor);
  });
});
