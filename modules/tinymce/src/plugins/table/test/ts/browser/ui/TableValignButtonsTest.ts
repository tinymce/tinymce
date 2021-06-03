import { Assertions, Keys, Waiter } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { SugarBody, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.ui.TableValignButtonsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablecellvalign',
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

  const setEditorSingleCellContentTableAndSelection = (editor: Editor) => {
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

  const assertSingleCellStructureHasValign = (editor: Editor, align: 'top' | 'middle' | 'bottom') => {
    TinyAssertions.assertContent(editor, '<table>' +
      '<tbody>' +
        '<tr>' +
          `<td style="vertical-align: ${align};">Filler</td>` +
        '</tr>' +
      '</tbody>' +
    '</table>');
  };

  const assertSingleCellStructureDoNotHaveValign = (editor: Editor) => {
    TinyAssertions.assertContent(editor, '<table>' +
      '<tbody>' +
        '<tr>' +
          '<td>Filler</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>');
  };

  const setEditorMultipleCellsContentTableAndSelection = (editor: Editor) => {
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

  const assertMultipleCellsStructureHasValign = (editor: Editor, align: 'top' | 'middle' | 'bottom') => {
    TinyAssertions.assertContent(editor, '<table>' +
      '<tbody>' +
        '<tr>' +
          `<td style="vertical-align: ${align};">Filler</td>` +
          `<td style="vertical-align: ${align};">Filler</td>` +
        '</tr>' +
        '<tr>' +
          `<td style="vertical-align: ${align};">Filler</td>` +
          `<td style="vertical-align: ${align};">Filler</td>` +
        '</tr>' +
      '</tbody>' +
    '</table>');
  };

  const assertMultipleCellsStructureDoNotHaveValign = (editor: Editor) => {
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
    TinyUiActions.clickOnToolbar(editor, 'button[title="Vertical align"]');

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
      '.tox-collection__item[aria-checked="false"]': 4,
      'div[title="None"]': 1,
      'div[title="Top"]': 1,
      'div[title="Middle"]': 1,
      'div[title="Bottom"]': 1
    };

    await pAssertMenuPresence(editor, 'Menu should open, but not have any checkmarks', expected, container);
  };

  const pToggleValign = async (editor: Editor, align: 'None' | 'Top' | 'Middle' | 'Bottom') => {
    openMenu(editor);
    await TinyUiActions.pWaitForUi(editor, `div[title="${align}"]`);
    TinyUiActions.clickOnUi(editor, `div[title="${align}"]`);
    closeMenu(editor);
  };

  const pAssertCheckmark = async (editor: Editor, align: 'None' | 'Top' | 'Middle' | 'Bottom', sugarContainer: SugarElement<HTMLElement>) => {
    const expected = {
      '.tox-menu': 1,
      [`.tox-collection__item[aria-checked="true"][title="${align}"]`]: 1,
      '.tox-collection__item[aria-checked="false"]': 3,
      '.tox-collection__item[aria-checked="true"]': 1,
    };
    await pAssertMenuPresence(editor, 'There should be a checkmark', expected, sugarContainer);
  };

  context('Test for a single cell selection', () => {
    it('TINY-7477: Check that valign works for Top value', async () => {
      const editor = hook.editor();
      const sugarContainer = SugarBody.body();
      setEditorSingleCellContentTableAndSelection(editor);
      await pAssertNoCheckmarksInMenu(editor, sugarContainer);

      await pToggleValign(editor, 'Top');
      await pAssertCheckmark(editor, 'Top', sugarContainer);
      assertSingleCellStructureHasValign(editor, 'top');

      await pToggleValign(editor, 'None');
      await pAssertNoCheckmarksInMenu(editor, sugarContainer);
      assertSingleCellStructureDoNotHaveValign(editor);
    });

    it('TINY-7477: Check that valign works for Middle value', async () => {
      const editor = hook.editor();
      const sugarContainer = SugarBody.body();
      setEditorSingleCellContentTableAndSelection(editor);
      await pAssertNoCheckmarksInMenu(editor, sugarContainer);

      await pToggleValign(editor, 'Middle');
      await pAssertCheckmark(editor, 'Middle', sugarContainer);
      assertSingleCellStructureHasValign(editor, 'middle');

      await pToggleValign(editor, 'None');
      await pAssertNoCheckmarksInMenu(editor, sugarContainer);
      assertSingleCellStructureDoNotHaveValign(editor);
    });

    it('TINY-7477: Check that valign works for Bottom value', async () => {
      const editor = hook.editor();
      const sugarContainer = SugarBody.body();
      setEditorSingleCellContentTableAndSelection(editor);
      await pAssertNoCheckmarksInMenu(editor, sugarContainer);

      await pToggleValign(editor, 'Bottom');
      await pAssertCheckmark(editor, 'Bottom', sugarContainer);
      assertSingleCellStructureHasValign(editor, 'bottom');

      await pToggleValign(editor, 'None');
      await pAssertNoCheckmarksInMenu(editor, sugarContainer);
      assertSingleCellStructureDoNotHaveValign(editor);
    });
  });

  context('Test for multiple cell selection', () => {
    it('TINY-7477: Check that valign works for Top value', async () => {
      const editor = hook.editor();
      const sugarContainer = SugarBody.body();
      setEditorMultipleCellsContentTableAndSelection(editor);
      await pAssertNoCheckmarksInMenu(editor, sugarContainer);

      await pToggleValign(editor, 'Top');
      await pAssertCheckmark(editor, 'Top', sugarContainer);
      assertMultipleCellsStructureHasValign(editor, 'top');

      await pToggleValign(editor, 'None');
      await pAssertNoCheckmarksInMenu(editor, sugarContainer);
      assertMultipleCellsStructureDoNotHaveValign(editor);
    });

    it('TINY-7477: Check that valign works for Middle value', async () => {
      const editor = hook.editor();
      const sugarContainer = SugarBody.body();
      setEditorMultipleCellsContentTableAndSelection(editor);
      await pAssertNoCheckmarksInMenu(editor, sugarContainer);

      await pToggleValign(editor, 'Middle');
      await pAssertCheckmark(editor, 'Middle', sugarContainer);
      assertMultipleCellsStructureHasValign(editor, 'middle');

      await pToggleValign(editor, 'None');
      await pAssertNoCheckmarksInMenu(editor, sugarContainer);
      assertMultipleCellsStructureDoNotHaveValign(editor);
    });

    it('TINY-7477: Check that valign works for Bottom value', async () => {
      const editor = hook.editor();
      const sugarContainer = SugarBody.body();
      setEditorMultipleCellsContentTableAndSelection(editor);
      await pAssertNoCheckmarksInMenu(editor, sugarContainer);

      await pToggleValign(editor, 'Bottom');
      await pAssertCheckmark(editor, 'Bottom', sugarContainer);
      assertMultipleCellsStructureHasValign(editor, 'bottom');

      await pToggleValign(editor, 'None');
      await pAssertNoCheckmarksInMenu(editor, sugarContainer);
      assertMultipleCellsStructureDoNotHaveValign(editor);
    });
  });
});
