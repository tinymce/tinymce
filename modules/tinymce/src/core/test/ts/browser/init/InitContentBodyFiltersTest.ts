import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.init.InitContentBodyFiltersTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.parser.addNodeFilter('p', (nodes) => {
          Arr.each(nodes, (node) => {
            // Remove style attributes from node
            node.attr('style', null);
            node.attr('data-mce-style', null);
          });
        });
      });
    }
  }, [ Theme ], true);

  it('TINY-4742: Insert content to activate node filters, check content is in editor', () => {
    const editor = hook.editor();
    editor.setContent('<p style="color: rgb(255, 0, 0);">abc</p>');
    // If an exception occurs, then no content will be inserted into the editor
    TinyAssertions.assertContent(editor, '<p>abc</p>');
  });
});
