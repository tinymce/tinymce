import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Hierarchy, Insert, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.keyboard.InsertKeysTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const fireInsert = (editor: Editor) => {
    editor.dispatch('input', { isComposing: false } as InputEvent);
  };

  const insertEmptyTextNodesAt = (editor: Editor, count: number, path: number[], insert: (marker: SugarElement, element: SugarElement) => void) => {
    const elm = Hierarchy.follow(TinyDom.body(editor), path).getOrDie('Could not follow path');
    Arr.each(Arr.range(count, Fun.identity), () => {
      insert(elm, SugarElement.fromDom(document.createTextNode('')));
    });
  };

  const prependEmptyTextNodesAt = (editor: Editor, count: number, path: number[]) => insertEmptyTextNodesAt(editor, count, path, Insert.before);

  const appendEmptyTextNodesAt = (editor: Editor, count: number, path: number[]) => insertEmptyTextNodesAt(editor, count, path, Insert.after);

  beforeEach(() => {
    hook.editor().focus();
  });

  context('Insert key in text with in nbsp text node', () => {
    context('Nbsp at first character position', () => {
      it('Insert in text node with nbsp at start of block', () => {
        const editor = hook.editor();
        editor.setContent('<p>&nbsp;a</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<p>&nbsp;a</p>');
      });

      it('Insert in text in node with leading nbsp after inline with trailing space', () => {
        const editor = hook.editor();
        editor.setContent('<p>a<em>b </em>&nbsp;c</p>');
        TinySelections.setCursor(editor, [ 0, 2 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 2 ], 2, [ 0, 2 ], 2);
        TinyAssertions.assertContent(editor, '<p>a<em>b </em>&nbsp;c</p>');
      });

      it('Insert in text in node with leading nbsp after inline', () => {
        const editor = hook.editor();
        editor.setContent('<p>a<em>b</em>&nbsp;c</p>');
        TinySelections.setCursor(editor, [ 0, 2 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 2 ], 2, [ 0, 2 ], 2);
        TinyAssertions.assertContent(editor, '<p>a<em>b</em> c</p>');
      });

      it('Insert in text in node with leading nbsp after inline with trailing nbsp', () => {
        const editor = hook.editor();
        editor.setContent('<p>a<em>b&nbsp;</em>&nbsp;c</p>');
        TinySelections.setCursor(editor, [ 0, 2 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 2 ], 2, [ 0, 2 ], 2);
        TinyAssertions.assertContent(editor, '<p>a<em>b&nbsp;</em> c</p>');
      });

      it('Insert at beginning of text node with leading nbsp after a br', () => {
        const editor = hook.editor();
        editor.setContent('<p>a<br />&nbsp;b</p>');
        TinySelections.setCursor(editor, [ 0, 2 ], 0);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
        TinyAssertions.assertContent(editor, '<p>a<br>&nbsp;b</p>');
      });

      it('Insert at beginning of text node with leading nbsp within inline element followed by br', () => {
        const editor = hook.editor();
        editor.setContent('<p>a<br /><em>&nbsp;b</em></p>');
        TinySelections.setCursor(editor, [ 0, 2, 0 ], 0);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 2, 0 ], 0, [ 0, 2, 0 ], 0);
        TinyAssertions.assertContent(editor, '<p>a<br><em>&nbsp;b</em></p>');
      });
    });

    context('Nbsp at last character position', () => {
      it('Insert in text node with nbsp at end of block', () => {
        const editor = hook.editor();
        editor.setContent('<p>a&nbsp;</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
        TinyAssertions.assertContent(editor, '<p>a&nbsp;</p>');
      });

      it('Insert in text in node with leading nbsp after inline with trailing space', () => {
        const editor = hook.editor();
        editor.setContent('<p>a&nbsp;<em> b</em>c</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
        TinyAssertions.assertContent(editor, '<p>a&nbsp;<em> b</em>c</p>');
      });

      it('Insert in text in node with trailing nbsp before inline', () => {
        const editor = hook.editor();
        editor.setContent('<p>a&nbsp;<em>b</em>c</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
        TinyAssertions.assertContent(editor, '<p>a <em>b</em>c</p>');
      });

      it('Insert in text in node with trailing nbsp before inline with leading nbsp', () => {
        const editor = hook.editor();
        editor.setContent('<p>a&nbsp;<em>&nbsp;b</em>c</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
        TinyAssertions.assertContent(editor, '<p>a <em>&nbsp;b</em>c</p>');
      });

      it('Insert in text in node with single middle nbsp', () => {
        const editor = hook.editor();
        editor.setContent('<p>a&nbsp;b</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 3);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 3, [ 0, 0 ], 3);
        TinyAssertions.assertContent(editor, '<p>a b</p>');
      });

      it('Insert in text in node with multiple middle nbsp', () => {
        const editor = hook.editor();
        editor.setContent('<p>a&nbsp;b&nbsp;c&nbsp;d</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 7);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 7, [ 0, 0 ], 7);
        TinyAssertions.assertContent(editor, '<p>a b c d</p>');
      });

      it('Insert in text node multiple nbsps between inline elements', () => {
        const editor = hook.editor();
        editor.setContent('<p><em>a</em>&nbsp;&nbsp;<em>b</em></p>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0, 1 ], 1);
        TinyAssertions.assertContent(editor, '<p><em>a</em> &nbsp;<em>b</em></p>');
      });
    });

    context('Nbsp at fragmented text', () => {
      it('Insert nbsp at end of text block with leading empty text nodes should retain the nbsp', () => {
        const editor = hook.editor();
        editor.setContent('<p>&nbsp;a</p>');
        prependEmptyTextNodesAt(editor, 3, [ 0, 0 ]);
        TinySelections.setCursor(editor, [ 0, 3 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 3 ], 2, [ 0, 3 ], 2);
        TinyAssertions.assertContent(editor, '<p>&nbsp;a</p>');
      });

      it('Insert nbsp at end of text block with trailing empty text nodes should retain the nbsp', () => {
        const editor = hook.editor();
        editor.setContent('<p>a&nbsp;</p>');
        appendEmptyTextNodesAt(editor, 3, [ 0, 0 ]);
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<p>a&nbsp;</p>');
      });
    });

    context('Nbsp at img', () => {
      it('Insert nbsp before an image at start of a block should not remove the nbsp', () => {
        const editor = hook.editor();
        editor.setContent('<p>&nbsp;<img src="about:blank" /></p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
        TinyAssertions.assertContent(editor, '<p>&nbsp;<img src="about:blank"></p>');
      });

      it('Insert nbsp between two images should remove nbsp', () => {
        const editor = hook.editor();
        editor.setContent('<p><img src="about:blank" />&nbsp;<img src="about:blank" /></p>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0, 1 ], 1);
        TinyAssertions.assertContent(editor, '<p><img src="about:blank"> <img src="about:blank"></p>');
      });

      it('Insert nbsp after an image at the end of a block should not remove the nbsp', () => {
        const editor = hook.editor();
        editor.setContent('<p><img src="about:blank" />&nbsp;</p>');
        TinySelections.setCursor(editor, [ 0, 1 ], 1);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0, 1 ], 1);
        TinyAssertions.assertContent(editor, '<p><img src="about:blank">&nbsp;</p>');
      });
    });

    context('Nbsp in pre', () => {
      it('Trim nbsp at beginning of text in pre element', () => {
        const editor = hook.editor();
        editor.setContent('<pre>&nbsp;a</pre>');
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<pre> a</pre>');
      });

      it('Trim nbsp at end of text in pre element', () => {
        const editor = hook.editor();
        editor.setContent('<pre>a&nbsp;</pre>');
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<pre>a </pre>');
      });

      it('Trim nbsp middle of text in pre element', () => {
        const editor = hook.editor();
        editor.setContent('<pre>a&nbsp;b</pre>');
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<pre>a b</pre>');
      });
    });

    context('Nbsp in pre: white-space: pre-wrap', () => {
      it('Trim nbsp at start of text in white-space: pre-line element', () => {
        const editor = hook.editor();
        editor.setContent('<pre style="white-space: pre-wrap;">&nbsp;a</pre>');
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<pre style="white-space: pre-wrap;"> a</pre>');
      });

      it('Trim nbsp at end of text in white-space: pre-line element', () => {
        const editor = hook.editor();
        editor.setContent('<pre style="white-space: pre-wrap;">a&nbsp;</pre>');
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<pre style="white-space: pre-wrap;">a </pre>');
      });

      it('Trim nbsp in middle of text in in white-space: pre-line element', () => {
        const editor = hook.editor();
        editor.setContent('<pre style="white-space: pre-wrap;">a&nbsp;b</pre>');
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<pre style="white-space: pre-wrap;">a b</pre>');
      });
    });

    describe('Nbsp in pre: white-space: pre-line', () => {
      it('Do not trim nbsp at beginning of text in white-space: pre-line element', () => {
        const editor = hook.editor();
        editor.setContent('<pre style="white-space: pre-line;">&nbsp;a</pre>');
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<pre style="white-space: pre-line;">&nbsp;a</pre>');
      });

      it('Do not trim nbsp at end of text in white-space: pre-line element', () => {
        const editor = hook.editor();
        editor.setContent('<pre style="white-space: pre-line;">a&nbsp;</pre>');
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<pre style="white-space: pre-line;">a&nbsp;</pre>');
      });

      it('Trim nbsp in middle of text in in white-space: pre-line element', () => {
        const editor = hook.editor();
        editor.setContent('<pre style="white-space: pre-line;">a&nbsp;b</pre>');
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<pre style="white-space: pre-line;">a b</pre>');
      });
    });

    context('Nbsp before/after block', () => {
      it('Do not trim nbsp before a block element', () => {
        const editor = hook.editor();
        editor.setContent('<div>a&nbsp;<p>b</p></div>');
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<div>a&nbsp;<p>b</p></div>');
      });

      it('Do not trim nbsp after a block element', () => {
        const editor = hook.editor();
        editor.setContent('<div><p>b</p>&nbsp;a</div>');
        TinySelections.setCursor(editor, [ 0, 1 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 1 ], 2, [ 0, 1 ], 2);
        TinyAssertions.assertContent(editor, '<div><p>b</p>&nbsp;a</div>');
      });

      it('Do not trim nbsp in an inline before a block element', () => {
        const editor = hook.editor();
        editor.setContent('<div><em>a&nbsp;</em><p>b</p></div>');
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 2, [ 0, 0, 0 ], 2);
        TinyAssertions.assertContent(editor, '<div><em>a&nbsp;</em><p>b</p></div>');
      });

      it('Do not trim nbsp in an inline after a block element', () => {
        const editor = hook.editor();
        editor.setContent('<div><p>b</p><em>&nbsp;a</em></div>');
        TinySelections.setCursor(editor, [ 0, 1, 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 2, [ 0, 1, 0 ], 2);
        TinyAssertions.assertContent(editor, '<div><p>b</p><em>&nbsp;a</em></div>');
      });
    });
  });
});
