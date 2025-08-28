import { context, describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyAssertions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitContentBodySelectionTest', () => {
  const initAndAssertContent = (label: string, html: string, path: number[], offset = 0, extraSettings = {}) => {
    it(label, async () => {
      const editor = await McEditor.pFromHtml<Editor>(`<textarea>${html}</textarea>`, {
        menubar: false,
        toolbar: false,
        base_url: '/project/tinymce/js/tinymce',
        ...extraSettings
      });
      TinyAssertions.assertSelection(editor, path, offset, path, offset);
      assert.isFalse(editor.hasFocus(), `Check editor doesn't have focus`);
      McEditor.remove(editor);
    });
  };

  context('TINY-4139: Paragraph tests', () => {
    initAndAssertContent('Test p with br', '<p><br /></p>', [ 0 ]);
    initAndAssertContent('Test p', '<p>Initial Content</p>', [ 0, 0 ]);
    initAndAssertContent('Test h1', '<h1>Initial Content</h1>', [ 0, 0 ]);
    initAndAssertContent('Test p with inline styles', '<p><span style="font-weight: bold">Initial Content</span></p>', [ 0, 0, 0 ]);
    initAndAssertContent('Test p with noneditable span', '<p><span class="mceNonEditable">Initial Content</span></p>', [ 0, 0 ]);
    initAndAssertContent('Test noneditable p', '<p class="mceNonEditable">Initial Content</p>', [ 0 ]);
    initAndAssertContent('Test cef p', '<p contenteditable="false">Initial Content</p>', [ 0 ]);
  });

  context('TINY-4139: More complex content tests', () => {
    initAndAssertContent('Test a (which should be wrapped in a p on init)', '<a href="www.google.com">Initial Content</a>', [ 0, 0, 0 ], 1);
    initAndAssertContent('Test a in paragraph', '<p><a href="www.google.com">Initial Content</a></p>', [ 0, 0, 0 ], 1);
    initAndAssertContent('Test list', '<ul><li>Initial Content</li></ul>', [ 0, 0, 0 ]);
    initAndAssertContent('Test image (which should be wrapped in a p on init)', '<img src="https://www.google.com/logos/google.jpg" alt="My alt text" width="354" height="116" />', [ 0 ]);
    initAndAssertContent('Test image in p', '<p><img src="https://www.google.com/logos/google.jpg" alt="My alt text" width="354" height="116" /></p>', [ 0 ]);
    initAndAssertContent('Test table', '<table><tbody><tr><td>Initial Content</td></tr></tbody></table>', [ 0, 0, 0, 0, 0 ]);
  });

  context('TINY-4139: div and forced_root_block tests', () => {
    initAndAssertContent('Test div with br', '<div><br /></div>', [ 0 ]);
    initAndAssertContent('Test div', '<div>Initial Content</div>', [ 0, 0 ]);
    initAndAssertContent('Test div with br with forced_root_block=div', '<div><br /></div>', [ 0 ], 0, { forced_root_block: 'div' });
    initAndAssertContent('Test div with forced_root_block=div', '<div>Initial Content</div>', [ 0, 0 ], 0, { forced_root_block: 'div' });
  });
});
