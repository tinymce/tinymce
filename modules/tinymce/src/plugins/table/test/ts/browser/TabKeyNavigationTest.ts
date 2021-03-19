import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyContentActions, TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.TabKeyNavigationTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

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

    const events: Array<EditorEvent<TableModifiedEvent>> = [];
    const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
      events.push(event);
    };
    editor.on('TableModified', logEvent);

    editor.setContent('<table><tbody><tr><td>A1</td><td>A2</td></tr><tr><td>B1</td><td>B2</td></tr></tbody></table><p>x</p>');

    LegacyUnit.setSelection(editor, 'tr:nth-child(2) td:nth-child(2)', 0);
    assert.lengthOf(events, 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertContentPresence(editor, { tr: 3 });
    assert.lengthOf(events, 1);
    assert.equal(events[0].type, 'tablemodified');
    editor.off('tablemodified', logEvent);
  });
});
