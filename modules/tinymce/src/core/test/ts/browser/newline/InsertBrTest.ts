import { ApproxStructure } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Height, Scroll, WindowVisualViewport } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { linebreak } from 'tinymce/core/newline/InsertBr';

describe('browser.tinymce.core.newline.InsertBrTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  beforeEach(() => {
    hook.editor().focus();
  });

  context('Enter inside inline boundary link', () => {
    it('Insert br at beginning of inline boundary link', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<a href="#">b</a>c</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      editor.nodeChanged();
      linebreak.insert(editor);
      TinyAssertions.assertSelection(editor, [ 0, 2, 0 ], 1, [ 0, 2, 0 ], 1);
      TinyAssertions.assertContent(editor, '<p>a<br><a href="#">b</a>c</p>');
    });

    it('Insert br in middle inline boundary link', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<a href="#">bc</a>d</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1);
      editor.nodeChanged();
      linebreak.insert(editor);
      TinyAssertions.assertSelection(editor, [ 0, 1 ], 2, [ 0, 1 ], 2);
      TinyAssertions.assertContent(editor, '<p>a<a href="#">b<br>c</a>d</p>');
    });

    it('Insert br at end of inline boundary link', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<a href="#">b</a>c</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1);
      editor.nodeChanged();
      linebreak.insert(editor);
      TinyAssertions.assertSelection(editor, [ 0 ], 3, [ 0 ], 3);
      TinyAssertions.assertContent(editor, '<p>a<a href="#">b</a><br><br>c</p>');
    });

    it('Insert br at end of inline boundary link with trailing br', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<a href="#">b</a><br /></p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1);
      editor.nodeChanged();
      linebreak.insert(editor);
      TinyAssertions.assertSelection(editor, [ 0 ], 3, [ 0 ], 3);
      TinyAssertions.assertContent(editor, '<p>a<a href="#">b</a><br><br></p>');
    });
  });

  context('Enter inside inline boundary code', () => {
    it('Insert br at beginning of boundary code', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<code>b</code>c</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      editor.nodeChanged();
      linebreak.insert(editor);
      TinyAssertions.assertSelection(editor, [ 0, 1 ], 2, [ 0, 1 ], 2);
      TinyAssertions.assertContent(editor, '<p>a<code><br>b</code>c</p>');
    });

    it('Insert br at middle of boundary code', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<code>bc</code>d</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1);
      editor.nodeChanged();
      linebreak.insert(editor);
      TinyAssertions.assertSelection(editor, [ 0, 1 ], 2, [ 0, 1 ], 2);
      TinyAssertions.assertContent(editor, '<p>a<code>b<br>c</code>d</p>');
    });

    it('Insert br at end of boundary code', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<code>b</code>c</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1);
      editor.nodeChanged();
      linebreak.insert(editor);
      TinyAssertions.assertSelection(editor, [ 0, 1, 2 ], 0, [ 0, 1, 2 ], 0);
      TinyAssertions.assertContent(editor, '<p>a<code>b<br></code>c</p>');
    });
  });

  it('Insert br after text', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.nodeChanged();
    linebreak.insert(editor);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('a')),
              s.element('br', {}),
              s.element('br', {})
            ]
          })
        ]
      }))
    );
    TinyAssertions.assertSelection(editor, [ 0 ], 2, [ 0 ], 2);
  });

  it('Scrolls correctly to inserted br', () => {
    const editor = hook.editor();
    editor.setContent('');
    Arr.range(100, () => linebreak.insert(editor));
    const { top } = Scroll.get(TinyDom.document(editor));
    const offsetHeight = Height.get(TinyDom.body(editor));
    const { height } = WindowVisualViewport.getBounds(editor.getWin());

    TinyAssertions.assertCursor(editor, [ 0 ], 100); // assert cursor is at the last br
    assert.isAtMost(offsetHeight - top, height, 'Editor should be scrolled to the bottom of the view');
  });
});
