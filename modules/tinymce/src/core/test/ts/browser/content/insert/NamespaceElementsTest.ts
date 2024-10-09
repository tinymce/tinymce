import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.content.insert.NamespaceElementsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    extended_valid_elements: 'svg[width|height],math',
    valid_children: '+p[math]'
  }, [], true);

  it('TINY-10237: Inserting SVG elements but filter out things like scripts and invalid children', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.insertContent('<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><desc><script>alert(1)</script><p>hello</p></circle></a></svg>');
    TinyAssertions.assertContent(editor, '<p>a<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><desc></desc></circle></svg>b</p>');
  });

  it('TINY-11332: Inserting SVG elements but filter out things like scripts keeping content', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.insertContent('<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><desc><script>alert(1)</script>hello</circle></a></svg>');
    TinyAssertions.assertContent(editor, '<p>a<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><desc>hello</desc></circle></svg>b</p>');
  });

  it('TINY-10809: Inserting math elements but filter out things like scripts', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.insertContent('<math><script>alert(1)</script><mrow><msup><mi>a</mi><mn>2</mn></msup></mrow></math>');
    TinyAssertions.assertContent(editor, '<p>a<math><mrow><msup><mi>a</mi><mn>2</mn></msup></mrow></math>b</p>');
  });
});
