import { Assertions, Keys, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

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

  const setEditorContentTableAndSelection = (editor: Editor) => {
    editor.setContent(
      '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td>Filler</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
    );

    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
  };

  const openMenu = (editor: Editor) =>
    TinyUiActions.clickOnToolbar(editor, 'button[title="Table styles"]');

  const closeMenu = (editor) =>
    TinyUiActions.keydown(editor, Keys.escape());

  const pCheckMenuPresence = async (editor: Editor, label: string, expected: Record<string, number>, container: SugarElement<HTMLElement>) => {
    openMenu(editor);
    await Waiter.pTryUntil('Ensure the correct values are present', () =>
      Assertions.assertPresence(label, expected, container)
    );
    closeMenu(editor);
  };

  const pNoCheckmarksInMenu = async (editor: Editor, container: SugarElement<HTMLElement>) => {
    const expected = {
      '.tox-menu': 1,
      '.tox-collection__item[aria-checked="true"]': 0,
      '.tox-collection__item[aria-checked="false"]': 2
    };

    await pCheckMenuPresence(editor, 'Menu should open, but not have any checkmarks', expected, container);
  };

  const toggleClasses = (editor: Editor, classes: string[]) => {
    Arr.each(classes, (clazz) =>
      editor.execCommand('mceTableToggleClass', false, clazz)
    );

    assert.lengthOf(events, classes.length, 'Command executed successfully.');
  };

  it('TINY-7476: Ensure that the checkmark appears for a single class', async () => {
    const editor = hook.editor();
    const sugarContainer = SugarBody.body();

    setEditorContentTableAndSelection(editor);
    await pNoCheckmarksInMenu(editor, sugarContainer);
    toggleClasses(editor, [ 'a' ]);

    const expected = {
      '.tox-menu': 1,
      '.tox-collection__item[aria-checked="true"]': 1,
      '.tox-collection__item[aria-checked="false"]': 1
    };
    await pCheckMenuPresence(editor, 'There should be a checkmark', expected, sugarContainer);
  });

  it('TINY-7476: Ensure that the checkmark appears for two classes', async () => {
    const editor = hook.editor();
    const sugarContainer = SugarBody.body();

    setEditorContentTableAndSelection(editor);
    await pNoCheckmarksInMenu(editor, sugarContainer);
    toggleClasses(editor, [ 'a', 'b' ]);

    const expected = {
      '.tox-menu': 1,
      '.tox-collection__item[aria-checked="true"]': 2,
      '.tox-collection__item[aria-checked="false"]': 0
    };

    await pCheckMenuPresence(editor, 'There should be two checkmarks', expected, sugarContainer);
  });
});
