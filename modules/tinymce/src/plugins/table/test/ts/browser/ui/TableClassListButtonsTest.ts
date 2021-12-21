import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TableModifiedEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Plugin from 'tinymce/plugins/table/Plugin';

import { pAssertMenuPresence, pAssertNoCheckmarksInMenu, setEditorContentTableAndSelection } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableClassListButtonsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tableclass tablecellclass',
    menu: {
      table: { title: 'Table', items: 'tableclass tablecellclass' },
    },
    menubar: 'table edit',
    base_url: '/project/tinymce/js/tinymce',
    table_class_list: [
      {
        title: 'A',
        value: 'a'
      },
      {
        title: 'B',
        value: 'b'
      },
      {
        title: 'submenu',
        menu: [
          {
            title: 'C',
            value: 'c'
          }
        ]
      }
    ],
    table_cell_class_list: [
      {
        title: 'D',
        value: 'd'
      },
      {
        title: 'E',
        value: 'e'
      },
      {
        title: 'submenu',
        menu: [
          {
            title: 'F',
            value: 'f'
          }
        ]
      }
    ],
    setup: (editor: Editor) => {
      editor.on('TableModified', logEvent);
    }
  }, [ Plugin ], true);

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  const toggleClasses = (editor: Editor, classes: string[], commandName: string) => {
    Arr.each(classes, (clazz) => editor.execCommand(commandName, false, clazz));
    assert.lengthOf(events, classes.length, 'Command executed successfully');
  };

  const pPerformToggleClassSetup = async (classList: string[], trueMarked: number, falseMarked: number, useMenuOrToolbar: 'toolbar' | 'menuitem', type: 'table' | 'cell') => {
    const editor = hook.editor();
    const sugarContainer = SugarBody.body();
    const title = type === 'table' ? 'Table styles' : 'Cell styles';

    setEditorContentTableAndSelection(editor, 1, 1);
    await pAssertNoCheckmarksInMenu(editor, title, 2, sugarContainer, useMenuOrToolbar);
    const commandName = type === 'table' ? 'mceTableToggleClass' : 'mceTableCellToggleClass';
    toggleClasses(editor, classList, commandName);

    const expected = {
      '.tox-menu': useMenuOrToolbar === 'toolbar' ? 1 : 2,
      '.tox-collection__item[aria-checked="true"]': trueMarked,
      '.tox-collection__item[aria-checked="false"]': falseMarked,
      '.tox-collection__item[aria-expanded="false"]:contains("submenu")': 1
    };
    await pAssertMenuPresence(editor, `There should be ${trueMarked} checkmark(s)`, title, expected, sugarContainer, useMenuOrToolbar);
    events = [];
  };

  it('TINY-7476: Ensure that the checkmark appears for a single class in toolbar', async () => {
    await pPerformToggleClassSetup([ 'a' ], 1, 1, 'toolbar', 'table');
    await pPerformToggleClassSetup([ 'd' ], 1, 1, 'toolbar', 'cell');
  });

  it('TINY-7476: Ensure that the checkmark appears for a single class in menu', async () => {
    await pPerformToggleClassSetup([ 'a' ], 1, 1, 'menuitem', 'table');
    await pPerformToggleClassSetup([ 'd' ], 1, 1, 'menuitem', 'cell');
  });

  it('TINY-7476: Ensure that the checkmark appears for two classes in toolbar', async () => {
    await pPerformToggleClassSetup([ 'a', 'b' ], 2, 0, 'toolbar', 'table');
    await pPerformToggleClassSetup([ 'd', 'e' ], 2, 0, 'toolbar', 'cell');
  });

  it('TINY-7476: Ensure that the checkmark appears for two classes in menu', async () => {
    await pPerformToggleClassSetup([ 'a', 'b' ], 2, 0, 'menuitem', 'table');
    await pPerformToggleClassSetup([ 'd', 'e' ], 2, 0, 'menuitem', 'cell');
  });
});
