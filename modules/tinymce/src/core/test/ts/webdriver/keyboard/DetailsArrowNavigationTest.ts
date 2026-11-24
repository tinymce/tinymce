import { RealKeys, Waiter } from '@ephox/agar';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.keyboard.DetailsArrowNavigationTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  if (PlatformDetection.detect().browser.isSafari()) {
    after(async () => {
      // An arrow key sent as text stops later Cmd+C and Cmd+V from copying or pasting for the rest of the session,
      // and an arrow key sent as a combo restores them
      await RealKeys.pSendKeysOn('body', [ RealKeys.combo({ shiftKey: true }, '\uE012') ]);
    });
  }

  const content = [
    '<details class="mce-accordion" open="open">' +
    '<summary>S1</summary>' +
    '<p>B1</p></details>' +
    '<details class="mce-accordion" open="open">' +
    '<summary>S2</summary>' +
    '<p>B2</p></details>'
  ].join('');

  const pArrowDown = async (): Promise<void> => {
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'ArrowDown') ]);
  };

  const pArrowUp = async (): Promise<void> => {
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'ArrowUp') ]);
  };

  const describeCaret = (editor: Editor): string => {
    // getStart resolves an element container + offset to the child node, so element-boundary carets are handled too
    const block = editor.selection.getStart().closest('summary,p,td');
    if (!block) {
      return `${editor.selection.getStart().nodeName} (no summary/p/td ancestor)`;
    }
    const label = `${block.nodeName.toLowerCase()} ("${block.textContent}")`;
    // Only the outermost details is indexed, so blocks in nested details or tables are identified by their text
    const topLevel = Arr.find(editor.getBody().children, (child) => child.contains(block));
    return topLevel.filter((child) => child.nodeName === 'DETAILS')
      .map((child) => `details[${Arr.indexOf(editor.getBody().children, child).getOr(-1)}] > ${label}`)
      .getOr(`body > ${label}`);
  };

  // Only the block containing the caret is asserted, not the exact offset: the browser keeps the caret's
  // horizontal position when moving vertically, and the summary text is indented by its disclosure marker,
  // so the offset reached in the next line depends on font metrics (e.g. Chrome lands at offset 2 of "B1").
  const assertCaretIn = (editor: Editor, expected: string): void => {
    assert.isTrue(editor.selection.isCollapsed(), `expected a collapsed selection in ${expected}`);
    assert.equal(describeCaret(editor), expected, `expected caret in ${expected}`);
  };

  // RealKeys resolves before the browser has applied the key, so wait for the caret to settle
  const pWaitForCaretIn = (editor: Editor, expected: string): Promise<void> =>
    Waiter.pTryUntil(`Wait for caret in ${expected}`, () => assertCaretIn(editor, expected));

  // TinySelections cannot express a backward selection, so set the anchor and focus on the native selection
  const setBaseAndExtent = (editor: Editor, anchorPath: number[], anchorOffset: number, focusPath: number[], focusOffset: number): void => {
    const resolve = (path: number[]): Node => Arr.foldl(path, (node: Node, index) => node.childNodes[index], editor.getBody());
    editor.focus();
    editor.getWin().getSelection()?.setBaseAndExtent(resolve(anchorPath), anchorOffset, resolve(focusPath), focusOffset);
    editor.nodeChanged();
    assert.isFalse(editor.selection.isCollapsed(), 'expected a non-collapsed selection');
  };

  it('TINYMCE-15129: ArrowDown moves the caret through open details: summary, body, next summary, next body', async () => {
    const editor = hook.editor();
    editor.setContent(content);
    TinyAssertions.assertContent(editor, content);

    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    assertCaretIn(editor, 'details[0] > summary ("S1")');

    await pArrowDown();
    await pWaitForCaretIn(editor, 'details[0] > p ("B1")');

    await pArrowDown();
    await pWaitForCaretIn(editor, 'details[1] > summary ("S2")');

    await pArrowDown();
    await pWaitForCaretIn(editor, 'details[1] > p ("B2")');
  });

  it('TINYMCE-15129: ArrowUp moves the caret through open details: body, summary, prev body, prev summary', async () => {
    const editor = hook.editor();
    editor.setContent(content);
    TinyAssertions.assertContent(editor, content);

    TinySelections.setCursor(editor, [ 1, 1, 0 ], 0);
    assertCaretIn(editor, 'details[1] > p ("B2")');

    await pArrowUp();
    await pWaitForCaretIn(editor, 'details[1] > summary ("S2")');

    await pArrowUp();
    await pWaitForCaretIn(editor, 'details[0] > p ("B1")');

    await pArrowUp();
    await pWaitForCaretIn(editor, 'details[0] > summary ("S1")');
  });

  it('TINYMCE-15129: ArrowDown from the summary of a closed details moves the caret to the next summary', async () => {
    const editor = hook.editor();
    const closedContent = content.replace('<details class="mce-accordion" open="open">', '<details class="mce-accordion">');
    editor.setContent(closedContent);
    TinyAssertions.assertContent(editor, closedContent);

    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    assertCaretIn(editor, 'details[0] > summary ("S1")');

    await pArrowDown();
    await pWaitForCaretIn(editor, 'details[1] > summary ("S2")');
  });

  it('TINYMCE-15129: ArrowUp from the body of a details below a closed details moves the caret to its summary, then the closed summary', async () => {
    const editor = hook.editor();
    const closedContent = [
      '<p>before</p>',
      '<details class="mce-accordion">',
      '<summary>S1</summary>',
      '<p>B1</p></details>',
      '<details class="mce-accordion" open="open">',
      '<summary>S2</summary>',
      '<p>B2</p></details>'
    ].join('');
    editor.setContent(closedContent);
    TinyAssertions.assertContent(editor, closedContent);

    TinySelections.setCursor(editor, [ 2, 1, 0 ], 0);
    assertCaretIn(editor, 'details[2] > p ("B2")');

    await pArrowUp();
    await pWaitForCaretIn(editor, 'details[2] > summary ("S2")');

    await pArrowUp();
    await pWaitForCaretIn(editor, 'details[1] > summary ("S1")');
  });

  it('TINYMCE-15129: ArrowDown from the summary of an open details moves the caret into a nested closed details, then past it', async () => {
    const editor = hook.editor();
    const nestedContent = [
      '<details class="mce-accordion" open="open">',
      '<summary>S1</summary>',
      '<details class="mce-accordion">',
      '<summary>IS</summary>',
      '<p>IB</p></details>',
      '<p>B1</p></details>',
      '<p>after</p>'
    ].join('');
    editor.setContent(nestedContent);
    TinyAssertions.assertContent(editor, nestedContent);

    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    assertCaretIn(editor, 'details[0] > summary ("S1")');

    await pArrowDown();
    await pWaitForCaretIn(editor, 'details[0] > summary ("IS")');

    await pArrowDown();
    await pWaitForCaretIn(editor, 'details[0] > p ("B1")');

    await pArrowDown();
    await pWaitForCaretIn(editor, 'body > p ("after")');
  });

  it('TINYMCE-15129: ArrowDown from the body of a details moves the caret into the first cell of the table after it', async () => {
    const editor = hook.editor();
    const tableContent = [
      '<p>x</p>',
      '<details class="mce-accordion" open="open">',
      '<summary>S1</summary>',
      '<p>B1</p></details>',
      '<table><tbody><tr><td>c1</td><td>c2</td></tr></tbody></table>',
      '<p>after</p>'
    ].join('');
    editor.setContent(tableContent);

    TinySelections.setCursor(editor, [ 1, 1, 0 ], 0);
    assertCaretIn(editor, 'details[1] > p ("B1")');

    await pArrowDown();
    await pWaitForCaretIn(editor, 'body > td ("c1")');
  });

  it('TINYMCE-15129: ArrowUp from the block after an open details moves the caret to its body, then its summary', async () => {
    const editor = hook.editor();
    const surroundedContent = [
      '<p>before</p>',
      '<details class="mce-accordion" open="open">',
      '<summary>S1</summary>',
      '<p>B1</p></details>',
      '<p>after</p>'
    ].join('');
    editor.setContent(surroundedContent);
    TinyAssertions.assertContent(editor, surroundedContent);

    TinySelections.setCursor(editor, [ 2, 0 ], 0);
    assertCaretIn(editor, 'body > p ("after")');

    await pArrowUp();
    await pWaitForCaretIn(editor, 'details[1] > p ("B1")');

    await pArrowUp();
    await pWaitForCaretIn(editor, 'details[1] > summary ("S1")');
  });

  it('TINYMCE-15129: ArrowDown through a short line in the body of a details keeps the caret column', async () => {
    const editor = hook.editor();
    const longLine = 'abcdefghijklmnopqrstuvwxyz';
    const columnContent = [
      '<details class="mce-accordion" open="open">',
      '<summary>S1</summary>',
      `<p>${longLine}</p>`,
      '<p>x</p>',
      `<p>${longLine}</p></details>`,
      '<p>after</p>'
    ].join('');
    editor.setContent(columnContent);

    TinySelections.setCursor(editor, [ 0, 1, 0 ], 15);

    await pArrowDown();
    await pWaitForCaretIn(editor, 'details[0] > p ("x")');

    await pArrowDown();
    await pWaitForCaretIn(editor, `details[0] > p ("${longLine}")`);
    await Waiter.pTryUntil('Wait for the caret to return near its column', () => {
      const rng = editor.selection.getRng();
      assert.equal(rng.startContainer.parentNode, editor.getBody().querySelector('details')?.children[3], 'expected the caret in the last long line');
      assert.isAbove(rng.startOffset, 5, 'expected the caret column to be kept, not reset to the line start');
    });
  });

  context('Plain arrow over a ranged selection', () => {
    before(function () {
      // TINYMCE-15129: Safari follows the macOS convention and moves from the range start on ArrowUp and from the range end
      // on ArrowDown, whatever the selection direction, while Chrome and Firefox move from the focus. The Firefox-only
      // details navigation these cases cover does not run on Safari, so they would only assert WebKit's native behaviour.
      if (PlatformDetection.detect().browser.isSafari()) {
        this.skip();
      }
    });

    it('TINYMCE-15129: ArrowUp over a forward selection from a summary to its body moves the caret from the focus to the summary', async () => {
      const editor = hook.editor();
      editor.setContent(content);

      setBaseAndExtent(editor, [ 1, 0, 0 ], 1, [ 1, 1, 0 ], 1);

      await pArrowUp();
      await pWaitForCaretIn(editor, 'details[1] > summary ("S2")');
    });

    it('TINYMCE-15129: ArrowDown over a backward selection from a body to its summary moves the caret from the focus to the body', async () => {
      const editor = hook.editor();
      editor.setContent(content);

      setBaseAndExtent(editor, [ 0, 1, 0 ], 1, [ 0, 0, 0 ], 1);

      await pArrowDown();
      await pWaitForCaretIn(editor, 'details[0] > p ("B1")');
    });

    it('TINYMCE-15129: ArrowDown over a forward selection from a body to the next summary moves the caret from the focus to the next body', async () => {
      const editor = hook.editor();
      editor.setContent(content);

      setBaseAndExtent(editor, [ 0, 1, 0 ], 1, [ 1, 0, 0 ], 1);

      await pArrowDown();
      await pWaitForCaretIn(editor, 'details[1] > p ("B2")');
    });
  });
});
