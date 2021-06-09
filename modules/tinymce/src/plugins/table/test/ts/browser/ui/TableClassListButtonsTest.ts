import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';
import { assert } from 'chai';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { pAssertMenuPresence, pAssertNoCheckmarksInMenu, setEditorContentTableAndSelection } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableClassListButtonsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    table_class_list: [
      {
        title: 'A',
        value: 'a'
      },
      {
        title: 'B',
        value: 'b'
      }
    ],
    toolbar: 'tableclass',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    }
  }, [ Plugin, Theme ], true);

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  afterEach(() => {
    events = [];
  });

  const toggleClasses = (editor: Editor, classes: string[]) => {
    Arr.each(classes, (clazz) =>
      editor.execCommand('mceTableToggleClass', false, clazz)
    );

    assert.lengthOf(events, classes.length, 'Command executed successfully.');
  };

  it('TINY-7476: Ensure that the checkmark appears for a single class', async () => {
    const editor = hook.editor();
    const sugarContainer = SugarBody.body();

    setEditorContentTableAndSelection(editor, 1, 1);
    await pAssertNoCheckmarksInMenu(editor, 'Table styles', 2, sugarContainer);
    toggleClasses(editor, [ 'a' ]);

    const expected = {
      '.tox-menu': 1,
      '.tox-collection__item[aria-checked="true"]': 1,
      '.tox-collection__item[aria-checked="false"]': 1
    };
    await pAssertMenuPresence(editor, 'There should be a checkmark', 'Table styles', expected, sugarContainer);
  });

  it('TINY-7476: Ensure that the checkmark appears for two classes', async () => {
    const editor = hook.editor();
    const sugarContainer = SugarBody.body();

    setEditorContentTableAndSelection(editor, 1, 1);
    await pAssertNoCheckmarksInMenu(editor, 'Table styles', 2, sugarContainer);
    toggleClasses(editor, [ 'a', 'b' ]);

    const expected = {
      '.tox-menu': 1,
      '.tox-collection__item[aria-checked="true"]': 2,
      '.tox-collection__item[aria-checked="false"]': 0
    };

    await pAssertMenuPresence(editor, 'There should be two checkmarks', 'Table styles', expected, sugarContainer);
  });
});
