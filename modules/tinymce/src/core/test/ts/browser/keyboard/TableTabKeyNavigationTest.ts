import { Keys } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TableModifiedEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.core.keyboard.TableTabKeyNavigationTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };
  const clearEvents = () => events = [];

  afterEach(clearEvents);

  it('TBA: Tab key navigation', () => {
    const editor = hook.editor();

    editor.setContent('<table><tbody><tr><td>A1</td><td>A2</td></tr><tr><td>B1</td><td>B2</td></tr></tbody></table><p>x</p>');

    LegacyUnit.setSelection(editor, 'td', 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    assert.equal(editor.selection.getStart().innerHTML, 'A2');

    LegacyUnit.setSelection(editor, 'td', 0);
    TinyContentActions.keystroke(editor, Keys.tab(), { shiftKey: true });
    assert.equal(editor.selection.getStart().innerHTML, 'A1');

    LegacyUnit.setSelection(editor, 'td:nth-child(2)', 0);
    TinyContentActions.keystroke(editor, Keys.tab(), { shiftKey: true });
    assert.equal(editor.selection.getStart().innerHTML, 'A1');

    LegacyUnit.setSelection(editor, 'tr:nth-child(2) td:nth-child(2)', 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    assert.equal(editor.selection.getStart(true).nodeName, 'TD');
    TinyAssertions.assertContent(editor,
      '<table><tbody><tr><td>A1</td><td>A2</td></tr><tr><td>B1</td><td>B2' +
      '</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p>x</p>'
    );
  });

  it('TINY-7006: Fire TableModified event when rows are added via the Tab key', () => {
    const editor = hook.editor();

    editor.on('TableModified', logEvent);

    editor.setContent('<table><tbody><tr><td>A1</td><td>A2</td></tr><tr><td>B1</td><td>B2</td></tr></tbody></table><p>x</p>');

    LegacyUnit.setSelection(editor, 'tr:nth-child(2) td:nth-child(2)', 0);
    assert.lengthOf(events, 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertContentPresence(editor, { tr: 3 });
    assert.lengthOf(events, 1);
    assert.equal(events[0].type, 'tablemodified');
    // The first Tab keystroke will move to the second column
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertContentPresence(editor, { tr: 4 });
    assert.lengthOf(events, 2);
    assert.equal(events[1].type, 'tablemodified');
    editor.off('TableModified', logEvent);
  });

  context('Tab navigation with ranged selection', () => {
    it('TINY-6638: Navigates to next cell', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>cell 1</td></tr><tr><td>cell 2</td></tr></tbody></table>');

      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 6);
      assert.equal(editor.selection.getStart().innerHTML, 'cell 1');
      TinyContentActions.keystroke(editor, Keys.tab());

      // Cursor moves to next cell
      TinyAssertions.assertSelection(editor, [ 0, 0, 1, 0, 0 ], 0, [ 0, 0, 1, 0, 0 ], 0);
    });

    it('TINY-6638: Shift + Tab navigates to previous cell', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>cell 1</td></tr><tr><td>cell 2</td></tr></tbody></table>');

      TinySelections.setSelection(editor, [ 0, 0, 1, 0, 0 ], 0, [ 0, 0, 1, 0, 0 ], 6);
      assert.equal(editor.selection.getStart().innerHTML, 'cell 2');
      TinyContentActions.keystroke(editor, Keys.tab(), { shiftKey: true });

      // Cursor moves to previous cell
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('TINY-6638: Tabbing in last row creates a new row', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>cell 1</td></tr><tr><td>cell 2</td></tr></tbody></table>');
      TinyAssertions.assertContentPresence(editor, { tr: 2, td: 2 });

      TinySelections.setSelection(editor, [ 0, 0, 1, 0, 0 ], 0, [ 0, 0, 1, 0, 0 ], 6);
      assert.equal(editor.selection.getStart().innerHTML, 'cell 2');
      TinyContentActions.keystroke(editor, Keys.tab());

      // Creates a new cell + row and moves to it
      TinyAssertions.assertContentPresence(editor, { tr: 3, td: 3 });
      TinyAssertions.assertSelection(editor, [ 0, 0, 2, 0 ], 0, [ 0, 0, 2, 0 ], 0);
    });

    it('TINY-6638: Shift+Tab does nothing on first cell', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>cell 1</td></tr><tr><td>cell 2</td></tr></tbody></table>');
      TinyAssertions.assertContentPresence(editor, { tr: 2, td: 2 });

      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 6);
      assert.equal(editor.selection.getStart().innerHTML, 'cell 1');
      TinyContentActions.keystroke(editor, Keys.tab(), { shiftKey: true });

      // Selection stays in the same cell, but collapsed. Table stays the same
      TinyAssertions.assertContentPresence(editor, { tr: 2, td: 2 });
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('TINY-6683: Selection starts inside table, ends outside table', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>cell 1</td></tr><tr><td>cell 2</td></tr></tbody></table><p>outside</p>');

      TinySelections.setSelection(editor, [ 0, 0, 1, 0, 0 ], 0, [ 1, 0 ], 2);
      TinyContentActions.keystroke(editor, Keys.tab());
      // Selection does not move within editor
      TinySelections.setSelection(editor, [ 0, 0, 1, 0, 0 ], 0, [ 1, 0 ], 2);

      // Shift + Tab navigates to first cell
      TinySelections.setSelection(editor, [ 0, 0, 1, 0, 0 ], 0, [ 1, 0 ], 2);
      TinyContentActions.keystroke(editor, Keys.tab(), { shiftKey: true });
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('TINY-6683: (From top) Selection starts outside table, ends inside first row', () => {
      const editor = hook.editor();
      editor.setContent('<p>outside</p><table><tbody><tr><td>cell 1</td></tr><tr><td>cell 2</td></tr></tbody></table>');
      TinyAssertions.assertContentPresence(editor, { tr: 2, td: 2 });

      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0, 0, 0, 0 ], 2);
      TinyContentActions.keystroke(editor, Keys.tab());
      TinyAssertions.assertCursor(editor, [ 1, 0, 1, 0, 0 ], 0);
      TinyAssertions.assertContentPresence(editor, { tr: 2, td: 2 });

      // Shift + Tab does nothing
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0, 0, 0, 0 ], 2);
      TinyContentActions.keystroke(editor, Keys.tab(), { shiftKey: true });
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 1, 0, 0, 0, 0 ], 2);
    });

    it('TINY-6683: (From top) Selection starts outside table, ends inside last row', () => {
      const editor = hook.editor();
      editor.setContent('<p>outside</p><table><tbody><tr><td>cell 1</td></tr><tr><td>cell 2</td></tr></tbody></table>');
      TinyAssertions.assertContentPresence(editor, { tr: 2, td: 2 });

      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0, 1, 0, 0 ], 2);
      TinyContentActions.keystroke(editor, Keys.tab());

      // creates new row
      TinyAssertions.assertContentPresence(editor, { tr: 3, td: 3 });
      // selection is collapsed in new row
      TinyAssertions.assertCursor(editor, [ 1, 0, 2, 0 ], 0);
    });

    it('TINY-6683: Selection is entire table', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>cell 1</td></tr><tr><td>cell 2</td></tr></tbody></table>');
      TinyAssertions.assertContentPresence(editor, { tr: 2, td: 2 });

      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0, 0 ], 2);
      TinyContentActions.keystroke(editor, Keys.tab());

      // creates new row
      TinyAssertions.assertContentPresence(editor, { tr: 3, td: 3 });
      // selection is collapsed in new row
      TinyAssertions.assertCursor(editor, [ 0, 0, 2, 0 ], 0);
    });

    it('TINY-6683: Selection is entire table (shift + tab)', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>cell 1</td></tr><tr><td>cell 2</td></tr></tbody></table>');
      TinyAssertions.assertContentPresence(editor, { tr: 2, td: 2 });

      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0, 0 ], 2);
      TinyContentActions.keystroke(editor, Keys.tab(), { shiftKey: true });

      // Does not change table
      TinyAssertions.assertContentPresence(editor, { tr: 2, td: 2 });
      // selection is collapsed in first cell
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('TINY-6683: Tab clears fake selection', () => {
      const editor = hook.editor();
      editor.setContent(`
        <table data-mce-selected="1">
          <tbody>
            <tr>
              <td data-mce-selected="1" data-mce-first-selected="1">cell 1</td>
              <td data-mce-selected="1">cell 2</td>
            </tr>
            <tr>
              <td data-mce-selected="1">cell 3</td>
              <td data-mce-selected="1" data-mce-last-selected="1">cell 4</td>
            </tr>
          </tbody>
        </table>
      `);
      TinyAssertions.assertContentPresence(editor, { tr: 2, td: 4 });
      TinyAssertions.assertContentPresence(editor, { '[data-mce-selected="1"]': 5 });

      TinySelections.setCursor(editor, [ 0, 0, 1, 1, 0 ], 6);
      TinyContentActions.keystroke(editor, Keys.tab());

      TinyAssertions.assertContentPresence(editor, { tr: 3, td: 6 });
      // Tab clears fake selection on cells
      TinyAssertions.assertContentPresence(editor, { '[data-mce-selected="1"]': 1 });
    });
  });
});
