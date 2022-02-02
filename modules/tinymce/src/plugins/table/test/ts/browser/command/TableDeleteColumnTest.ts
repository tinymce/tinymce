import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.command.TableDeleteColumnTest', () => {
  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    }
  }, [ Plugin, Theme ], true);

  afterEach(() => {
    events = [];
  });

  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  const assertEvents = (count: number) => {
    assert.lengthOf(events, count);
    Arr.each(events, (event) => {
      assert.equal(event.type, 'tablemodified', 'Event name');
      assert.isTrue(event.structure, 'Table modified structure');
      assert.isFalse(event.style, 'Table modified style');
    });
  };

  it('TINY-7916: Delete all columns should delete the table', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>1</td><td>2</td><td>3</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 2, 0 ], 1);

    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 1, 0 ], 1);
    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertContent(editor, '');
    assertEvents(2);
  });

  it('TINY-7916: Delete all columns with a contenteditable=false column', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td contenteditable="false">1</td><td>2</td><td>3</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 2, 0 ], 1);

    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 1, 0 ], 1);
    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertContent(editor, '');
    assertEvents(2);
  });
});
