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
    toolbar: 'tableclass',
    menu: {
      table: { title: 'Table', items: 'tableclass' },
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
      }
    ],
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

  const pPerformToggleClassSetup = async (classList: string[], trueMarked: number, falseMarked: number, toolbar: boolean) => {
    const editor = hook.editor();
    const sugarContainer = SugarBody.body();

    setEditorContentTableAndSelection(editor, 1, 1);
    await pAssertNoCheckmarksInMenu(editor, 'Table styles', 2, sugarContainer, toolbar);
    toggleClasses(editor, classList);

    const expected = {
      '.tox-menu': toolbar ? 1 : 2,
      '.tox-collection__item[aria-checked="true"]': trueMarked,
      '.tox-collection__item[aria-checked="false"]': falseMarked
    };
    await pAssertMenuPresence(editor, `There should be ${trueMarked} checkmark(s)`, 'Table styles', expected, sugarContainer, toolbar);
  };

  it('TINY-7476: Ensure that the checkmark appears for a single class', async () => {
    await pPerformToggleClassSetup([ 'a' ], 1, 1, true);
  });

  it('TINY-7476: Ensure that the checkmark appears for a single class in menu', async () => {
    await pPerformToggleClassSetup([ 'a' ], 1, 1, false);
  });

  it('TINY-7476: Ensure that the checkmark appears for two classes', async () => {
    await pPerformToggleClassSetup([ 'a', 'b' ], 2, 0, true);
  });

  it('TINY-7476: Ensure that the checkmark appears for two classes in menu', async () => {
    await pPerformToggleClassSetup([ 'a', 'b' ], 2, 0, false);
  });
});
