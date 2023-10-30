import { RealKeys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('webdriver.tinymce.plugins.lists.DeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  context('backspace and delete', () => {
    it('TINY-10289: backspace from a `p` after an `ol` or delete from the last `li` inside the `ol` should merge the `p` inside the `li`', async () => {
      const editor = hook.editor();
      editor.on('keyup keydown', (e) => {
        // eslint-disable-next-line no-console
        console.log('e: ', e.isDefaultPrevented());
      });

      const initialContent = '<ol>' +
          '<li>' +
            '<span>List 1</span>' +
          '</li>' +
          '<li>' +
            '<h2>Header</h2>' +
            '<ol>' +
              '<li>List 1-1</li>' +
            '</ol>' +
            '<p>Place custor at the start of this line and hit backspace.</p>' +
          '</li>' +
        '</ol>';

      const expectedContent = '<ol>' +
          '<li>' +
            '<span>List 1</span>' +
          '</li>' +
          '<li>' +
            '<h2>Header</h2>' +
            '<ol>' +
              '<li>List 1-1Place custor at the start of this line and hit backspace.</li>' +
            '</ol>' +
          '</li>' +
        '</ol>';

      editor.setContent(initialContent, { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 1, 2 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
      TinyAssertions.assertContent(editor, expectedContent, { format: 'raw' });

      editor.setContent(initialContent, { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 1, 1, 0, 0 ], 'List 1-1'.length);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'Delete') ]);
      TinyAssertions.assertContent(editor, expectedContent, { format: 'raw' });
    });
  });
});
