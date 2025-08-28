import { describe, context, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinySelections, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.EditorPadEmptyWithBrTest', () => {
  Arr.each([ false, true ], (remove_trailing_brs: boolean) => {
    context(`remove_trailing_brs: ${remove_trailing_brs}`, () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        add_unload_trigger: false,
        disable_nodechange: true,
        custom_elements: 'custom1,~custom2',
        extended_valid_elements: 'custom1,custom2,script[*]',
        entities: 'raw',
        indent: false,
        base_url: '/project/tinymce/js/tinymce',
        pad_empty_with_br: true,
        remove_trailing_brs,
      }, [ Theme ]);

      it('TINY-9861: Pad empty elements with br', () => {
        const editor = hook.editor();
        editor.setContent('<p>a</p><p></p>');
        TinyAssertions.assertContent(editor, '<p>a</p><p><br></p>');
      });

      it('TINY-9861: Pad empty elements with br on insert at caret', () => {
        const editor = hook.editor();
        editor.setContent('<p>a</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        editor.insertContent('<p>b</p><p></p>');
        TinyAssertions.assertContent(editor, '<p>a</p><p>b</p><p><br></p>');
      });
    });
  });
});
