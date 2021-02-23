import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
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
    editor.fire('keydown', { keyCode: Keys.tab() } as KeyboardEvent);
    assert.equal(editor.selection.getStart().innerHTML, 'A2');

    LegacyUnit.setSelection(editor, 'td', 0);
    editor.fire('keydown', { keyCode: Keys.tab(), shiftKey: true } as KeyboardEvent);
    assert.equal(editor.selection.getStart().innerHTML, 'A1');

    LegacyUnit.setSelection(editor, 'td:nth-child(2)', 0);
    editor.fire('keydown', { keyCode: Keys.tab(), shiftKey: true } as KeyboardEvent);
    assert.equal(editor.selection.getStart().innerHTML, 'A1');

    LegacyUnit.setSelection(editor, 'tr:nth-child(2) td:nth-child(2)', 0);
    editor.fire('keydown', { keyCode: Keys.tab() } as KeyboardEvent);
    assert.equal(editor.selection.getStart(true).nodeName, 'TD');
    TinyAssertions.assertContent(editor,
      '<table><tbody><tr><td>A1</td><td>A2</td></tr><tr><td>B1</td><td>B2' +
      '</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p>x</p>'
    );
  });
});
