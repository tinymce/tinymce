import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/print/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.print.PrintSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'print',
    toolbar: 'print',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme, Plugin ]);

  it('TBA: Assert print button exists', async () => {
    const editor = hook.editor();
    await TinyUiActions.pWaitForUi(editor, 'button[aria-label="Print"]');
  });
});
