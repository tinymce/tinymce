import { ApproxStructure, Cursors } from '@ephox/agar';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as CaretFormat from 'tinymce/core/fmt/CaretFormat';
import * as InsertNewLine from 'tinymce/core/newline/InsertNewLine';

describe('browser.tinymce.core.newline.InsertNewLineTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const bookmarkSpan = '<span data-mce-type="bookmark" id="mce_2_start" data-mce-style="overflow:hidden;line-height:0px" style="overflow:hidden;line-height:0px"></span>';

  const insertNewline = (editor: Editor, args: Partial<EditorEvent<KeyboardEvent>>) => {
    InsertNewLine.insert(editor, args as EditorEvent<KeyboardEvent>);
  };

  /*
  This function is used as a replacement for the TinySelections.setCursor as some changes are performed to cursor position in this setup.
  */
  const setSelectionTo = (editor: Editor, path: number[], offset: number) => {
    const sel = editor.selection.getSel();

    if (Type.isNullable(sel)) {
      throw new Error('Sel is unexpectedly missing.');
    }

    const cursorPath = Cursors.path({
      startPath: path,
      soffset: offset,
      finishPath: path,
      foffset: offset
    });

    const cursorRange = Cursors.calculate(TinyDom.body(editor), cursorPath);

    const range = editor.contentDocument.createRange();
    range.setStart(cursorRange.start.dom, cursorRange.soffset);
    range.setEnd(cursorRange.finish.dom, cursorRange.foffset);

    if (PlatformDetection.detect().browser.isSafari()) {
      editor.selection.setRng(range);
    } else {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  context('Enter in paragraph', () => {
    it('Insert block before', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><p>ab</p>');
      TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
    });

    it('Split block in the middle', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<p>a</p><p>b</p>');
      TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
    });

    it('Insert block after', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 2);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<p>ab</p><p>&nbsp;</p>');
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    });

    it('Insert block after bookmark', () => {
      const editor = hook.editor();
      editor.setContent(`<p>${bookmarkSpan}<br data-mce-bogus="1"></p>`, { format: 'raw' });
      TinySelections.setCursor(editor, [ 0 ], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str) => s.element('body', {
          children: [
            s.element('p', {
              children: [
                ApproxStructure.fromHtml(bookmarkSpan),
                s.element('br', {
                  attrs: {
                    'data-mce-bogus': str.is('1')
                  }
                })
              ]
            }),
            s.element('p', {
              children: [
                s.element('br', {
                  attrs: {
                    'data-mce-bogus': str.is('1')
                  }
                })
              ]
            })
          ]
        }))
      );
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    });
  });

  context('CEF', () => {
    it('TINY-9098: insert newline on inline CEF element should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>before<span contenteditable="false">x</span>after</p>');
      TinySelections.select(editor, 'span', []);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<p>before<span contenteditable="false">x</span>after</p>');
    });

    it('TINY-9194: restore selection from the bookmark and insert newline after inline CEF element', () => {
      const editor = hook.editor();
      editor.setContent('<p><span contenteditable="false">a</span></p>');
      // actual content <p>&#xFEFF;<span contenteditable="false">a</span></p>
      TinySelections.setCursor(editor, [ 0 ], 2);
      // actual content <p><span contenteditable="false">a</span>&#xFEFF;</p>
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
      const bookmark = editor.selection.getBookmark();
      editor.selection.moveToBookmark(bookmark);
      // actual content <p><span contenteditable="false">a</span></p>
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<p><span contenteditable="false">a</span></p><p>&nbsp;</p>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });

    it('TINY-9461: should not split editing host in noneditable root', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const initialContent = '<p contenteditable="true">ab</p>';
        editor.setContent(initialContent);
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, initialContent);
      });
    });

    it('TINY-9461: should wrap div contents in paragraph and split inner paragraph in a div editing host inside a noneditable root', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div contenteditable="true">ab</div>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<div contenteditable="true"><p>a</p><p>b</p></div>');
      });
    });

    it('TINY-9461: should not split editing host', () => {
      const editor = hook.editor();
      const initialContent = '<div contenteditable="false"><p contenteditable="true">ab</p></div>';
      editor.setContent(initialContent);
      TinySelections.setCursor(editor, [ 1, 0, 0 ], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, initialContent);
    });

    it('TINY-9461: should wrap div contents in paragraph and split inner paragraph in a div editing host', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div contenteditable="false"><div contenteditable="true">ab</div></div>');
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<div contenteditable="false"><div contenteditable="true"><p>a</p><p>b</p></div></div>');
      });
    });

    it('TINY-9813: Placed a cursor is placed after a table, with a noneditable afterwards', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><br></td></tr></tbody></table><div contenteditable="false"></div>');
      setSelectionTo(editor, [], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>&nbsp;</td></tr></tbody></table><p>&nbsp;</p><div contenteditable="false">&nbsp;</div>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });

    it('TINY-9813: Placed a cursor is placed after a table, with an editable afterwards', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><br></td></tr></tbody></table><div contenteditable="true">&nbsp;</div>');
      setSelectionTo(editor, [], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>&nbsp;</td></tr></tbody></table><div contenteditable="true">&nbsp;</div><div contenteditable="true">&nbsp;</div>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });

    it('TINY-9813: Placed a cursor is placed after a table, with nothing', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><br></td></tr></tbody></table>');
      setSelectionTo(editor, [], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>&nbsp;</td></tr></tbody></table><p>&nbsp;</p>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
    });

    it('TINY-9813: Placed a cursor is placed after a table, with a noneditable afterwards, wrapped in div', () => {
      const editor = hook.editor();
      editor.setContent('<div><table><tbody><tr><td><br></td></tr></tbody></table><div contenteditable="false"></div></div>');
      setSelectionTo(editor, [ 0 ], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<div><table><tbody><tr><td>&nbsp;</td></tr></tbody></table><p>&nbsp;</p><div contenteditable="false">&nbsp;</div></div>');
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 0);
    });
  });

  context('br_newline_selector', () => {
    before(() => {
      hook.editor().options.set('br_newline_selector', 'p,div.test');
    });

    after(() => {
      hook.editor().options.unset('br_newline_selector');
    });

    it('Insert newline where br is forced (paragraph)', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<p>a<br>b</p>');
    });

    it('Insert newline where br is forced (div)', () => {
      const editor = hook.editor();
      editor.setContent('<div class="test">ab</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<div class="test">a<br>b</div>');
    });

    it('Insert newline where br is not forced', () => {
      const editor = hook.editor();
      editor.setContent('<div>ab</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<div>a</div><div>b</div>');
    });
  });

  context('no_newline_selector', () => {
    before(() => {
      hook.editor().options.set('no_newline_selector', 'p,div.test');
    });

    after(() => {
      hook.editor().options.unset('no_newline_selector');
    });

    it('Insert newline where newline is blocked (paragraph)', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<p>ab</p>');
    });

    it('Insert newline where newline is blocked (div)', () => {
      const editor = hook.editor();
      editor.setContent('<div class="test">ab</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<div class="test">ab</div>');
    });

    it('Insert newline where newline is not blocked', () => {
      const editor = hook.editor();
      editor.setContent('<div>ab</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      editor.nodeChanged();
      TinyAssertions.assertContent(editor, '<div>a</div><div>b</div>');
    });
  });

  it('Insert newline before image in link', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="#">a<img src="about:blank" /></a></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    insertNewline(editor, { });
    TinyAssertions.assertContent(editor, '<p><a href="#">a</a></p><p><a href="#"><img src="about:blank"></a></p>');
    TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
  });

  context('end_container_on_empty_block', () => {
    context('With the default value', () => {
      it('TINY-6559: Press Enter in blockquote', () => {
        const editor = hook.editor();
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2</p><p>&nbsp;</p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
      });

      it('TINY-6559: Press Shift+Enter in blockquote', () => {
        const editor = hook.editor();
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { shiftKey: true });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2<br><br></p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 1 ], 2, [ 0, 1 ], 2);
      });

      it('TINY-6559: Press Enter twice in blockquote', () => {
        const editor = hook.editor();
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2</p></blockquote><p>&nbsp;</p>');
        TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      });

      it('TINY-6559: Press Enter twice in blockquote while between two lines', () => {
        const editor = hook.editor();
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p></blockquote><p>&nbsp;</p><blockquote><p>Line 2</p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      });

      it('TINY-6559: Press Enter twice in a div', () => {
        const editor = hook.editor();
        editor.setContent('<div><p>Line 1</p><p>Line 2</p></div>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<div><p>Line 1</p><p>Line 2</p><p>&nbsp;</p><p>&nbsp;</p></div>');
        TinyAssertions.assertSelection(editor, [ 0, 3 ], 0, [ 0, 3 ], 0);
      });

      it('TINY-6559: Press Enter twice in a section', () => {
        const editor = hook.editor();
        editor.setContent('<section><p>Line 1</p><p>Line 2</p></section>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<section><p>Line 1</p><p>Line 2</p><p>&nbsp;</p><p>&nbsp;</p></section>');
        TinyAssertions.assertSelection(editor, [ 0, 3 ], 0, [ 0, 3 ], 0);
      });
    });

    context('Is set to "div"', () => {
      it('TINY-6559: Press Enter in blockquote', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', 'div');
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2</p><p>&nbsp;</p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
      });

      it('TINY-6559: Press Shift+Enter in blockquote', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', 'div');
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { shiftKey: true });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2<br><br></p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 1 ], 2, [ 0, 1 ], 2);
      });

      it('TINY-6559: Press Enter twice in blockquote', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', 'div');
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2</p><p>&nbsp;</p><p>&nbsp;</p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 3 ], 0, [ 0, 3 ], 0);
      });

      it('TINY-6559: Press Enter twice in blockquote while between two lines', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', 'div');
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>&nbsp;</p><p>&nbsp;</p><p>Line 2</p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
      });

      it('TINY-6559: Press Enter twice in a div', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', 'div');
        editor.setContent('<div><p>Line 1</p><p>Line 2</p></div>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<div><p>Line 1</p><p>Line 2</p></div><p>&nbsp;</p>');
        TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      });

      it('TINY-6559: Press Enter twice in a section', () => {
        const editor = hook.editor();
        editor.setContent('<section><p>Line 1</p><p>Line 2</p></section>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<section><p>Line 1</p><p>Line 2</p><p>&nbsp;</p><p>&nbsp;</p></section>');
        TinyAssertions.assertSelection(editor, [ 0, 3 ], 0, [ 0, 3 ], 0);
      });
    });

    context('Is set to "div,blockquote"', () => {
      it('TINY-6559: Press Enter in blockquote', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', 'div,blockquote');
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2</p><p>&nbsp;</p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
      });

      it('TINY-6559: Press Shift+Enter in blockquote', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', 'div,blockquote');
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { shiftKey: true });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2<br><br></p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 1 ], 2, [ 0, 1 ], 2);
      });

      it('TINY-6559: Press Enter twice in blockquote', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', 'div,blockquote');
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2</p></blockquote><p>&nbsp;</p>');
        TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      });

      it('TINY-6559: Press Enter twice in blockquote while between two lines', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', 'div,blockquote');
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p></blockquote><p>&nbsp;</p><blockquote><p>Line 2</p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      });

      it('TINY-6559: Press Enter twice in a div', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', 'div,blockquote');
        editor.setContent('<div><p>Line 1</p><p>Line 2</p></div>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<div><p>Line 1</p><p>Line 2</p></div><p>&nbsp;</p>');
        TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      });

      it('TINY-6559: Press Enter twice in a section', () => {
        const editor = hook.editor();
        editor.setContent('<section><p>Line 1</p><p>Line 2</p></section>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<section><p>Line 1</p><p>Line 2</p><p>&nbsp;</p><p>&nbsp;</p></section>');
        TinyAssertions.assertSelection(editor, [ 0, 3 ], 0, [ 0, 3 ], 0);
      });
    });

    context('Is set to true', () => {
      it('TINY-6559: Press Enter in blockquote', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', true);
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2</p><p>&nbsp;</p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
      });

      it('TINY-6559: Press Shift+Enter in blockquote', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', true);
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { shiftKey: true });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2<br><br></p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 1 ], 2, [ 0, 1 ], 2);
      });

      it('TINY-6559: Press Enter twice in blockquote', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', true);
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2</p></blockquote><p>&nbsp;</p>');
        TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      });

      it('TINY-6559: Press Enter twice in blockquote while between two lines', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', true);
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p></blockquote><p>&nbsp;</p><blockquote><p>Line 2</p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      });

      it('TINY-6559: Press Enter twice in a div', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', true);
        editor.setContent('<div><p>Line 1</p><p>Line 2</p></div>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<div><p>Line 1</p><p>Line 2</p></div><p>&nbsp;</p>');
        TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      });

      it('TINY-6559: Press Enter twice in a section', () => {
        const editor = hook.editor();
        editor.setContent('<section><p>Line 1</p><p>Line 2</p></section>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<section><p>Line 1</p><p>Line 2</p></section><p>&nbsp;</p>');
        TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      });
    });

    context('Is set to false', () => {
      it('TINY-6559: Press Enter in blockquote', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', false);
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2</p><p>&nbsp;</p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
      });

      it('TINY-6559: Press Shift+Enter in blockquote', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', false);
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { shiftKey: true });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2<br><br></p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 1 ], 2, [ 0, 1 ], 2);
      });

      it('TINY-6559: Press Enter twice in blockquote', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', false);
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>Line 2</p><p>&nbsp;</p><p>&nbsp;</p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 3 ], 0, [ 0, 3 ], 0);
      });

      it('TINY-6559: Press Enter twice in blockquote while between two lines', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', false);
        editor.setContent('<blockquote><p>Line 1</p><p>Line 2</p></blockquote>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<blockquote><p>Line 1</p><p>&nbsp;</p><p>&nbsp;</p><p>Line 2</p></blockquote>');
        TinyAssertions.assertSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
      });

      it('TINY-6559: Press Enter twice in a div', () => {
        const editor = hook.editor();
        editor.options.set('end_container_on_empty_block', false);
        editor.setContent('<div><p>Line 1</p><p>Line 2</p></div>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<div><p>Line 1</p><p>Line 2</p><p>&nbsp;</p><p>&nbsp;</p></div>');
        TinyAssertions.assertSelection(editor, [ 0, 3 ], 0, [ 0, 3 ], 0);
      });

      it('TINY-6559: Press Enter twice in a section', () => {
        const editor = hook.editor();
        editor.setContent('<section><p>Line 1</p><p>Line 2</p></section>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        insertNewline(editor, { });
        insertNewline(editor, { });
        TinyAssertions.assertContent(editor, '<section><p>Line 1</p><p>Line 2</p><p>&nbsp;</p><p>&nbsp;</p></section>');
        TinyAssertions.assertSelection(editor, [ 0, 3 ], 0, [ 0, 3 ], 0);
      });
    });
  });

  context('TINY-8458: newline_behavior "block"', () => {
    before(() => {
      hook.editor().options.set('newline_behavior', 'block');
    });

    after(() => {
      hook.editor().options.unset('newline_behavior');
    });

    it('Split block in the middle', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<p>a</p><p>b</p>');
      TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
    });

    it('Split block in the middle with shift+enter', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { shiftKey: true });
      TinyAssertions.assertContent(editor, '<p>a</p><p>b</p>');
      TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
    });

    context('ignores br_newline_selector', () => {
      before(() => {
        hook.editor().options.set('br_newline_selector', 'p');
      });

      after(() => {
        hook.editor().options.unset('br_newline_selector');
      });

      it('Insert newline where br is forced', () => {
        const editor = hook.editor();
        editor.setContent('<p>ab</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        editor.nodeChanged();
        TinyAssertions.assertContent(editor, '<p>a</p><p>b</p>');
      });
    });

    context('does not ignore no_newline_selector', () => {
      before(() => {
        hook.editor().options.set('no_newline_selector', 'p');
      });

      after(() => {
        hook.editor().options.unset('no_newline_selector');
      });

      it('Insert newline where newline is blocked', () => {
        const editor = hook.editor();
        editor.setContent('<p>ab</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        editor.nodeChanged();
        TinyAssertions.assertContent(editor, '<p>ab</p>');
      });
    });
  });

  context('TINY-8458: newline_behavior "linebreak"', () => {
    before(() => {
      hook.editor().options.set('newline_behavior', 'linebreak');
    });

    after(() => {
      hook.editor().options.unset('newline_behavior');
    });

    it('Split block in the middle', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<p>a<br>b</p>');
      TinyAssertions.assertSelection(editor, [ 0 ], 2, [ 0 ], 2);
    });

    it('Split block in the middle with shift+enter', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { shiftKey: true });
      TinyAssertions.assertContent(editor, '<p>a<br>b</p>');
      TinyAssertions.assertSelection(editor, [ 0 ], 2, [ 0 ], 2);
    });

    context('ignores br_newline_selector', () => {
      before(() => {
        hook.editor().options.set('br_newline_selector', 'p');
      });

      after(() => {
        hook.editor().options.unset('br_newline_selector');
      });

      it('Insert newline where br is not forced', () => {
        const editor = hook.editor();
        editor.setContent('<div>ab</div>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        editor.nodeChanged();
        TinyAssertions.assertContent(editor, '<div>a<br>b</div>');
      });
    });

    context('does not ignore no_newline_selector', () => {
      before(() => {
        hook.editor().options.set('no_newline_selector', 'p');
      });

      after(() => {
        hook.editor().options.unset('no_newline_selector');
      });

      it('Insert newline where newline is blocked', () => {
        const editor = hook.editor();
        editor.setContent('<p>ab</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        editor.nodeChanged();
        TinyAssertions.assertContent(editor, '<p>ab</p>');
      });
    });
  });

  context('TINY-8458: newline_behavior "invert"', () => {
    before(() => {
      hook.editor().options.set('newline_behavior', 'invert');
    });

    after(() => {
      hook.editor().options.unset('newline_behavior');
    });

    it('Split block in the middle', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { });
      TinyAssertions.assertContent(editor, '<p>a<br>b</p>');
      TinyAssertions.assertSelection(editor, [ 0 ], 2, [ 0 ], 2);
    });

    it('Split block in the middle with shift+enter', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      insertNewline(editor, { shiftKey: true });
      TinyAssertions.assertContent(editor, '<p>a</p><p>b</p>');
      TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
    });

    context('inverts br_newline_selector', () => {
      before(() => {
        hook.editor().options.set('br_newline_selector', 'p');
      });

      after(() => {
        hook.editor().options.unset('br_newline_selector');
      });

      it('Insert newline where br is forced', () => {
        const editor = hook.editor();
        editor.setContent('<p>ab</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        editor.nodeChanged();
        TinyAssertions.assertContent(editor, '<p>a</p><p>b</p>');
      });

      it('Insert newline where br is not forced', () => {
        const editor = hook.editor();
        editor.setContent('<div>ab</div>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        editor.nodeChanged();
        TinyAssertions.assertContent(editor, '<div>a<br>b</div>');
      });
    });

    context('does not ignore no_newline_selector', () => {
      before(() => {
        hook.editor().options.set('no_newline_selector', 'p');
      });

      after(() => {
        hook.editor().options.unset('no_newline_selector');
      });

      it('Insert newline where newline is blocked', () => {
        const editor = hook.editor();
        editor.setContent('<p>ab</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        insertNewline(editor, { });
        editor.nodeChanged();
        TinyAssertions.assertContent(editor, '<p>ab</p>');
      });
    });
  });

  it('TINY-9794: Press Enter in a blockquote and then add format and then press Enter again should exit from the blockquote', () => {
    const editor = hook.editor();
    editor.setContent('<blockquote><p>A</p></blockquote>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    insertNewline(editor, { });
    CaretFormat.applyCaretFormat(editor, 'bold');
    insertNewline(editor, { });
    TinyAssertions.assertContent(editor, '<blockquote><p>A</p></blockquote><p>&nbsp;</p>');
    TinyAssertions.assertCursor(editor, [ 1, 0, 0, 0 ], 0);
  });
});
