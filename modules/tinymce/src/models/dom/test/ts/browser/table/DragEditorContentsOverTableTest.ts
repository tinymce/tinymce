import { Mouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SelectorExists, SelectorFind } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.models.dom.table.DragEditorContentsOverTableTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  it('TINY-9021: Should not render resize bars while dragging', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>1</td><td>2</td></tr></tbody></table>');

    editor.fire('dragstart');
    const cell = SelectorFind.descendant(TinyDom.body(editor), 'td').getOrDie();
    Mouse.mouseOver(cell, { dx: 0, dy: 0 });
    assert.isFalse(SelectorExists.descendant(TinyDom.documentElement(editor), '.ephox-snooker-resizer-bar'), 'Should not exist any resize bars');
    editor.fire('dragend');
  });
});

