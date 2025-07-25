import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Focus } from '@ephox/sugar';
import { TinyHooks, TinyAssertions, TinySelections, TinyDom, TinyContentActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.selection.FigcaptionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('TINY-12458: should place cursor at start of figcaption when focused', () => {
    const editor = hook.editor();
    editor.setContent(
      '<figure contenteditable="false">' +
        '<img src="https://www.google.com/logos/google.jpg" />' +
        '<figcaption contenteditable="true">Caption</figcaption>' +
      '</figure>'
    );
    TinySelections.setSelection(editor, [], 0, [], 1);
    const figcaption = UiFinder.findIn<HTMLElement>(TinyDom.body(editor), 'figcaption').getOrDie();
    Focus.focus(figcaption);
    TinyContentActions.type(editor, 'prefix-');

    TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 'prefix-'.length);
    TinyAssertions.assertContent(editor, [
      '<figure contenteditable="false"><img src="https://www.google.com/logos/google.jpg">',
      '<figcaption contenteditable="true">prefix-Caption</figcaption>',
      '</figure>'
    ].join('\n'));
  });
});
