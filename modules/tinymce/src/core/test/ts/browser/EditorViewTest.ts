import { before, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, Scroll, SelectorFind } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as EditorView from 'tinymce/core/EditorView';

describe('browser.tinymce.core.EditorViewTest', () => {

  const getEditorRect = (editor: Editor) => {
    if (editor.inline) {
      return editor.getBody().getBoundingClientRect();
    } else {
      return SelectorFind.descendant(TinyDom.contentAreaContainer(editor), 'iframe')
        .map((elm) => elm.dom.getBoundingClientRect())
        .getOrDie();
    }
  };

  const setBodyStyles = (editor: Editor, css: Record<string, string>) => {
    Css.setAll(TinyDom.body(editor), css);
  };

  const assertIsXYInContentArea = (editor: Editor, deltaX: number, deltaY: number) => {
    const hiddenScrollbar = Scroll.scrollBarWidth() === 0;
    const dx1 = -25 - deltaX;
    const dy1 = -25 - deltaY;
    const dx2 = -5 - deltaX;
    const dy2 = -5 - deltaY;

    const rect = getEditorRect(editor);
    const right = editor.inline ? rect.right : rect.width;
    const bottom = editor.inline ? rect.bottom : rect.height;

    assert.isTrue(
      EditorView.isXYInContentArea(editor, right + dx1, bottom + dy1),
      'Should be inside the area since the scrollbars are excluded'
    );
    assert.equal(
      hiddenScrollbar,
      EditorView.isXYInContentArea(editor, right + dx2, bottom + dy2),
      (hiddenScrollbar ?
        'Should be inside the area since the scrollbars are hidden' :
        'Should be outside the area since the coordinate is on the scrollbars')
    );
  };

  const setContentToBigDiv = (editor: Editor) => {
    editor.setContent('<div style="width: 5000px; height: 5000px">X</div>');
  };

  Arr.each([
    { label: 'Iframe Editor', setup: TinyHooks.bddSetup, settings: {}},
    { label: 'Inline Editor', setup: TinyHooks.bddSetup, settings: { inline: true }},
    { label: 'Shadow Dom Editor', setup: TinyHooks.bddSetupInShadowRoot, settings: {}}
  ], (tester) => {
    context(tester.label, () => {
      const hook = tester.setup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        ...tester.settings
      }, []);

      before(() => {
        const editor = hook.editor();
        if (editor.inline) {
          setBodyStyles(editor, { width: '100px', height: '100px', overflow: 'scroll' });
        }
      });

      it('TBA: isXYInContentArea without borders, margin', () => {
        const editor = hook.editor();
        setBodyStyles(editor, { border: '0', margin: '0' });
        setContentToBigDiv(editor);
        assertIsXYInContentArea(editor, 0, 0);
      });

      it('TBA: isXYInContentArea margin', () => {
        const editor = hook.editor();
        setBodyStyles(editor, { margin: '15px' });
        setContentToBigDiv(editor);
        const expectedDelta = editor.inline ? -15 : 0;
        assertIsXYInContentArea(editor, expectedDelta, expectedDelta);
      });

      it('TBA: isXYInContentArea with borders, margin', () => {
        const editor = hook.editor();
        setBodyStyles(editor, { border: '5px', margin: '15px' });
        setContentToBigDiv(editor);
        const expectedDelta = editor.inline ? -20 : 0;
        assertIsXYInContentArea(editor, expectedDelta, expectedDelta);
      });

      it('TINY-6354: isEditorAttachedToDom should return true', () => {
        const attached = EditorView.isEditorAttachedToDom(hook.editor());
        assert.isTrue(attached, 'Editor should be attached to the DOM');
      });
    });
  });
});
