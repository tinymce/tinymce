import { Assertions, Keys, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { SugarBody, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.ui.TableBorderStyleTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablecellborderstyle',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    },
    table_border_styles: [
      {
        title: 'Solid',
        value: 'solid'
      },
      {
        title: 'None',
        value: ''
      },
    ]
  }, [ Plugin, Theme ], true);

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  afterEach(() => {
    events = [];
  });

  const setEditorContentTableSingleCellAndSelection = (editor: Editor) => {
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

  const assertSingleCellStructureHasStyle = (editor: Editor) => {
    TinyAssertions.assertContent(editor, '<table>' +
      '<tbody>' +
        '<tr>' +
          '<td style="border-style: solid;">Filler</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>');
  };

  const assertSingleCellStructureIsStyleless = (editor: Editor) => {
    TinyAssertions.assertContent(editor, '<table>' +
      '<tbody>' +
        '<tr>' +
          '<td>Filler</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>');
  };

  const setEditorContentTableMultipleCellsAndSelection = (editor: Editor) => {
    editor.setContent(
      '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td data-mce-selected="1" data-mce-first-selected="1">Filler</td>' +
            '<td data-mce-selected="1">Filler</td>' +
          '</tr>' +
          '<tr>' +
            '<td data-mce-selected="1">Filler</td>' +
            '<td data-mce-selected="1" data-mce-last-selected="1">Filler</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
    );

    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
  };

  const assertMultipleCellsStructureHasStyle = (editor: Editor) => {
    TinyAssertions.assertContent(editor, '<table>' +
      '<tbody>' +
        '<tr>' +
          '<td style="border-style: solid;">Filler</td>' +
          '<td style="border-style: solid;">Filler</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="border-style: solid;">Filler</td>' +
          '<td style="border-style: solid;">Filler</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>');
  };

  const assertMultipleCellsStructureIsStyleless = (editor: Editor) => {
    TinyAssertions.assertContent(editor, '<table>' +
      '<tbody>' +
        '<tr>' +
          '<td>Filler</td>' +
          '<td>Filler</td>' +
        '</tr>' +
        '<tr>' +
          '<td>Filler</td>' +
          '<td>Filler</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>');
  };

  const openMenu = (editor: Editor) =>
    TinyUiActions.clickOnToolbar(editor, 'button[title="Border style"]');

  const closeMenu = (editor) =>
    TinyUiActions.keydown(editor, Keys.escape());

  const pAssertMenuPresence = async (editor: Editor, label: string, expected: Record<string, number>, container: SugarElement<HTMLElement>) => {
    openMenu(editor);
    await Waiter.pTryUntil('Ensure the correct values are present', () =>
      Assertions.assertPresence(label, expected, container)
    );
    closeMenu(editor);
  };

  const pAssertNoCheckmarksInMenu = async (editor: Editor, container: SugarElement<HTMLElement>) => {
    const expected = {
      '.tox-menu': 1,
      '.tox-collection__item[aria-checked="true"]': 0,
      '.tox-collection__item[aria-checked="false"]': 2,
      'div[title="None"]': 1,
      'div[title="Solid"]': 1,
    };

    await pAssertMenuPresence(editor, 'Menu should open, but not have any checkmarks', expected, container);
  };

  const pSetBorderStyle = async (editor: Editor, toggleOn: boolean) => {
    openMenu(editor);
    await TinyUiActions.pWaitForUi(editor, `div[title="${toggleOn ? 'Solid' : 'None'}"]`);
    TinyUiActions.clickOnUi(editor, `div[title="${toggleOn ? 'Solid' : 'None'}"]`);
    closeMenu(editor);
  };

  const pAssertCheckmark = async (editor: Editor, sugarContainer: SugarElement<HTMLElement>) => {
    const expected = {
      '.tox-menu': 1,
      '.tox-collection__item[aria-checked="true"][title="Solid"]': 1,
      '.tox-collection__item[aria-checked="false"]': 1,
      '.tox-collection__item[aria-checked="true"]': 1,
    };
    await pAssertMenuPresence(editor, 'There should be a checkmark', expected, sugarContainer);
  };

  it('TINY-7478: Ensure the table border style adds and removes it as expected for a single cell', async () => {
    const editor = hook.editor();
    const sugarContainer = SugarBody.body();
    setEditorContentTableSingleCellAndSelection(editor);
    await pAssertNoCheckmarksInMenu(editor, sugarContainer);

    await pSetBorderStyle(editor, true);
    await pAssertCheckmark(editor, sugarContainer);
    assertSingleCellStructureHasStyle(editor);

    await pSetBorderStyle(editor, false);
    await pAssertNoCheckmarksInMenu(editor, sugarContainer);
    assertSingleCellStructureIsStyleless(editor);
  });

  it('TINY-7478: Ensure the table border style adds and removes it as expected for multiple cells', async () => {
    const editor = hook.editor();
    const sugarContainer = SugarBody.body();
    setEditorContentTableMultipleCellsAndSelection(editor);
    await pAssertNoCheckmarksInMenu(editor, sugarContainer);

    await pSetBorderStyle(editor, true);
    await pAssertCheckmark(editor, sugarContainer);
    assertMultipleCellsStructureHasStyle(editor);

    await pSetBorderStyle(editor, false);
    await pAssertNoCheckmarksInMenu(editor, sugarContainer);
    assertMultipleCellsStructureIsStyleless(editor);
  });
});
