import { Keys, Mouse } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { type SugarElement, SugarLocation } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import { isCaretContainerBlock } from 'tinymce/core/caret/CaretContainer';

describe('browser.tinymce.core.selection.ClickBesideDetailsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    entities: 'raw',
    indent: false,
    content_style: 'body { margin: 16px; }',
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const detailsHtml = '<details open="open"><summary>Summary</summary><p>Body</p></details>';

  const assertSelectionIsCaretBlock = (editor: Editor, caretValue: 'before' | 'after') => {
    const selectedNode = editor.selection.getNode();
    assert.isTrue(isCaretContainerBlock(selectedNode), 'Selected node should be a fake caret node');
    assert.equal(selectedNode.getAttribute('data-mce-caret'), caretValue);
  };

  const assertNoFakeCaret = (editor: Editor) =>
    TinyAssertions.assertContentPresence(editor, {
      'p[data-mce-caret]': 0,
      'div.mce-visual-caret': 0
    });

  const clickBesideDetails = (editor: Editor, details: HTMLElement, clickPoint: 'before' | 'after', target: SugarElement<Element>, offset: number = 8) => {
    const summary = details.querySelector('summary') as HTMLElement;
    const detailsRect = details.getBoundingClientRect();
    const summaryRect = summary.getBoundingClientRect();
    const clientX = clickPoint === 'before' ? detailsRect.left - offset : detailsRect.right + offset;
    const clientY = summaryRect.top + (summaryRect.height / 2);

    const dx = clientX - SugarLocation.absolute(target).left;
    const dy = clientY - SugarLocation.absolute(target).top;
    Mouse.mouseDown(target, { dx, dy, button: 0 });
  };

  // Uses the rect of the element's text (not of the element itself, which spans the full width) so the click lands on the text
  const mouseDownMiddleOfText = (editor: Editor, element: HTMLElement) => {
    const rng = editor.dom.createRng();
    rng.selectNodeContents(element);
    const rect = rng.getBoundingClientRect();
    const clientX = rect.left + rect.width / 2;
    const clientY = rect.top + rect.height / 2;
    return editor.dispatch('mousedown', { target: element as EventTarget, clientX, clientY, button: 0 } as MouseEvent);
  };

  const getDetails = (editor: Editor, index: number = 0) => editor.dom.select('details')[index];

  it('TINYMCE-9955: clicking to the left of a details element should show a fake caret before it', () => {
    const editor = hook.editor();
    editor.setContent(detailsHtml);
    clickBesideDetails(editor, getDetails(editor), 'before', TinyDom.body(editor));
    assertSelectionIsCaretBlock(editor, 'before');
    TinyAssertions.assertContentPresence(editor, {
      'p[data-mce-caret="before"]': 1,
      'div.mce-visual-caret': 1
    });
    TinyAssertions.assertContent(editor, detailsHtml);
  });

  it('TINYMCE-9955: clicking to the right of a details element should show a fake caret after it', () => {
    const editor = hook.editor();
    editor.setContent(detailsHtml);
    clickBesideDetails(editor, getDetails(editor), 'after', TinyDom.body(editor));
    assertSelectionIsCaretBlock(editor, 'after');
    TinyAssertions.assertContentPresence(editor, {
      'p[data-mce-caret="after"]': 1,
      'div.mce-visual-caret': 1
    });
    TinyAssertions.assertContent(editor, detailsHtml);
  });

  it('TINYMCE-9955: clicking to the left of a details element with the document element as target should show a fake caret before it', () => {
    const editor = hook.editor();
    editor.setContent(detailsHtml);
    clickBesideDetails(editor, getDetails(editor), 'before', TinyDom.documentElement(editor));
    assertSelectionIsCaretBlock(editor, 'before');
    TinyAssertions.assertContentPresence(editor, {
      'p[data-mce-caret="before"]': 1,
      'div.mce-visual-caret': 1
    });
    TinyAssertions.assertContent(editor, detailsHtml);
  });

  it('TINYMCE-9955: clicking to the left of a details element and typing should insert a paragraph before it', async () => {
    const editor = hook.editor();
    editor.setContent(detailsHtml);
    clickBesideDetails(editor, getDetails(editor), 'before', TinyDom.body(editor));
    assertSelectionIsCaretBlock(editor, 'before');
    await TinyContentActions.pType(editor, 'a');
    TinyAssertions.assertContent(editor, '<p>a</p>' + detailsHtml);
  });

  it('TINYMCE-9955: clicking to the left of the second of two adjacent details elements should show a fake caret between them', () => {
    const editor = hook.editor();
    const firstHtml = '<details open="open"><summary>First</summary><p>First body</p></details>';
    const secondHtml = '<details open="open"><summary>Second</summary><p>Second body</p></details>';
    editor.setContent(firstHtml + secondHtml);
    const secondDetails = getDetails(editor, 1);
    clickBesideDetails(editor, secondDetails, 'before', TinyDom.body(editor));
    assertSelectionIsCaretBlock(editor, 'before');
    const previous = secondDetails.previousSibling as HTMLElement | null;
    assert.isTrue(isCaretContainerBlock(previous), 'The node before the second details should be the fake caret block');
    assert.equal(previous?.getAttribute('data-mce-caret'), 'before');
    assert.equal(previous?.previousSibling, getDetails(editor, 0), 'The fake caret block should be after the first details');
    TinyAssertions.assertContentPresence(editor, {
      'p[data-mce-caret="before"]': 1,
      'div.mce-visual-caret': 1
    });
    TinyAssertions.assertContent(editor, firstHtml + secondHtml);
  });

  it('TINYMCE-9955: clicking on the summary text should not show a fake caret', async () => {
    const editor = hook.editor();
    editor.setContent(detailsHtml);
    const summary = editor.dom.select('summary')[0];
    const evt = mouseDownMiddleOfText(editor, summary);
    assert.isFalse(evt.isDefaultPrevented(), 'The mousedown event should not be prevented');
    assertNoFakeCaret(editor);
    TinyAssertions.assertContent(editor, detailsHtml);
  });

  it('TINYMCE-9955: clicking on the text of a paragraph in the details body should not show a fake caret', () => {
    const editor = hook.editor();
    editor.setContent(detailsHtml);
    const paragraph = editor.dom.select('details > p')[0];
    const evt = mouseDownMiddleOfText(editor, paragraph);
    assert.isFalse(evt.isDefaultPrevented(), 'The mousedown event should not be prevented');
    assertNoFakeCaret(editor);
    TinyAssertions.assertContent(editor, detailsHtml);
  });

  context('Vertical navigation from a fake caret beside a details element', () => {
    const closedDetailsHtml = '<details><summary>Summary</summary><p>Body</p></details>';

    const showFakeCaret = (editor: Editor, content: string, clickPoint: 'before' | 'after', index: number = 0) => {
      editor.setContent(content);
      clickBesideDetails(editor, getDetails(editor, index), clickPoint, TinyDom.body(editor));
      assertSelectionIsCaretBlock(editor, clickPoint);
    };

    const testVerticalNavigation = (
      content: string,
      clickPoint: 'before' | 'after',
      key: 'up' | 'down',
      expectedPath: number[],
      expectedOffset: number,
      index: number = 0
    ) => {
      const editor = hook.editor();
      showFakeCaret(editor, content, clickPoint, index);
      TinyContentActions.keystroke(editor, key === 'up' ? Keys.up() : Keys.down());
      assertNoFakeCaret(editor);
      TinyAssertions.assertCursor(editor, expectedPath, expectedOffset);
      TinyAssertions.assertContent(editor, content);
    };

    it('TINYMCE-9955: ArrowDown from a fake caret before a details element should move into the summary', () =>
      testVerticalNavigation(detailsHtml, 'before', 'down', [ 0, 0, 0 ], 0));

    it('TINYMCE-9955: ArrowDown from a fake caret before a closed details element should move into the summary', () =>
      testVerticalNavigation(closedDetailsHtml, 'before', 'down', [ 0, 0, 0 ], 0));

    it('TINYMCE-9955: ArrowDown from a fake caret before a details element with content before should move into the summary', () =>
      testVerticalNavigation('<p>Before</p>' + detailsHtml, 'before', 'down', [ 1, 0, 0 ], 0));

    it('TINYMCE-9955: ArrowUp from a fake caret after an open details element should move to the end of its body', () =>
      testVerticalNavigation(detailsHtml + '<p>After</p>', 'after', 'up', [ 0, 1, 0 ], 'Body'.length));

    it('TINYMCE-9955: ArrowUp from a fake caret after a closed details element should move to the end of its summary', () =>
      testVerticalNavigation(closedDetailsHtml + '<p>After</p>', 'after', 'up', [ 0, 0, 0 ], 'Summary'.length));

    it('TINYMCE-9955: ArrowUp from a fake caret before a details element should move to the previous line', () =>
      testVerticalNavigation('<p>Before</p>' + detailsHtml, 'before', 'up', [ 0, 0 ], 'Before'.length));

    it('TINYMCE-9955: ArrowDown from a fake caret after a details element should move to the next line', () =>
      testVerticalNavigation(detailsHtml + '<p>After</p>', 'after', 'down', [ 1, 0 ], 0));

    it('TINYMCE-9955: ArrowUp from a fake caret between two details elements should move to the end of the first one', () => {
      const firstHtml = '<details open="open"><summary>First</summary><p>First body</p></details>';
      const secondHtml = '<details open="open"><summary>Second</summary><p>Second body</p></details>';
      testVerticalNavigation(firstHtml + secondHtml, 'before', 'up', [ 0, 1, 0 ], 'First body'.length, 1);
    });

    it('TINYMCE-9955: ArrowDown from a fake caret between two details elements should move into the summary of the second one', () => {
      const firstHtml = '<details><summary>First</summary><p>First body</p></details>';
      const secondHtml = '<details open="open"><summary>Second</summary><p>Second body</p></details>';
      testVerticalNavigation(firstHtml + secondHtml, 'after', 'down', [ 1, 0, 0 ], 0);
    });

    const testKeepsFakeCaret = (clickPoint: 'before' | 'after', key: 'up' | 'down') => {
      const editor = hook.editor();
      showFakeCaret(editor, detailsHtml, clickPoint);
      TinyContentActions.keystroke(editor, key === 'up' ? Keys.up() : Keys.down());
      assertSelectionIsCaretBlock(editor, clickPoint);
      TinyAssertions.assertContentPresence(editor, {
        [`p[data-mce-caret="${clickPoint}"]`]: 1,
        'div.mce-visual-caret': 1
      });
      TinyAssertions.assertContent(editor, detailsHtml);
    };

    it('TINYMCE-9955: ArrowUp from a fake caret before a details element with no content above should keep the fake caret', () =>
      testKeepsFakeCaret('before', 'up'));

    it('TINYMCE-9955: ArrowDown from a fake caret after a details element with no content below should keep the fake caret', () =>
      testKeepsFakeCaret('after', 'down'));
  });
});
