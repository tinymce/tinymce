import { Assertions, Keys, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
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

  const checkStructureHasValign = (editor: Editor, align: 'top' | 'middle' | 'bottom') => {
    TinyAssertions.assertContent(editor, '<table>' +
      '<tbody>' +
        '<tr>' +
          `<td style="vertical-align: ${align};">Filler</td>` +
        '</tr>' +
      '</tbody>' +
    '</table>');
  };

  const checkStructureDoNotHaveValign = (editor: Editor) => {
    TinyAssertions.assertContent(editor, '<table>' +
      '<tbody>' +
        '<tr>' +
          '<td>Filler</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>');
  };

  const openMenu = (editor: Editor) =>
    TinyUiActions.clickOnToolbar(editor, 'button[title="Vertical align"]');

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
      '.tox-collection__item[aria-checked="false"]': 4,
      'div[title="None"]': 1,
      'div[title="Top"]': 1,
      'div[title="Middle"]': 1,
      'div[title="Bottom"]': 1
    };

    await pCheckMenuPresence(editor, 'Menu should open, but not have any checkmarks', expected, container);
  };

  const pToggleValign = async (editor: Editor, align: 'None' | 'Top' | 'Middle' | 'Bottom') => {
    openMenu(editor);
    await TinyUiActions.pWaitForUi(editor, `div[title="${align}"]`);
    TinyUiActions.clickOnUi(editor, `div[title="${align}"]`);
    closeMenu(editor);
  };

  const pTestCheckmark = async (editor: Editor, align: 'None' | 'Top' | 'Middle' | 'Bottom', sugarContainer: SugarElement<HTMLElement>) => {
    const expected = {
      '.tox-menu': 1,
      [`.tox-collection__item[aria-checked="true"][title="${align}"]`]: 1,
      '.tox-collection__item[aria-checked="false"]': 3,
      '.tox-collection__item[aria-checked="true"]': 1,
    };
    await pCheckMenuPresence(editor, 'There should be a checkmark', expected, sugarContainer);
  };

  it('TINY-7477: Check that valign works for Top value', async () => {
    const editor = hook.editor();
    const sugarContainer = SugarBody.body();
    setEditorContentTableAndSelection(editor);
    await pNoCheckmarksInMenu(editor, sugarContainer);

    await pToggleValign(editor, 'Top');
    await pTestCheckmark(editor, 'Top', sugarContainer);
    checkStructureHasValign(editor, 'top');

    await pToggleValign(editor, 'None');
    await pNoCheckmarksInMenu(editor, sugarContainer);
    checkStructureDoNotHaveValign(editor);
  });

  it('TINY-7477: Check that valign works for Middle value', async () => {
    const editor = hook.editor();
    const sugarContainer = SugarBody.body();
    setEditorContentTableAndSelection(editor);
    await pNoCheckmarksInMenu(editor, sugarContainer);

    await pToggleValign(editor, 'Middle');
    await pTestCheckmark(editor, 'Middle', sugarContainer);
    checkStructureHasValign(editor, 'middle');

    await pToggleValign(editor, 'None');
    await pNoCheckmarksInMenu(editor, sugarContainer);
    checkStructureDoNotHaveValign(editor);
  });

  it('TINY-7477: Check that valign works for Bottom value', async () => {
    const editor = hook.editor();
    const sugarContainer = SugarBody.body();
    setEditorContentTableAndSelection(editor);
    await pNoCheckmarksInMenu(editor, sugarContainer);

    await pToggleValign(editor, 'Bottom');
    await pTestCheckmark(editor, 'Bottom', sugarContainer);
    checkStructureHasValign(editor, 'bottom');

    await pToggleValign(editor, 'None');
    await pNoCheckmarksInMenu(editor, sugarContainer);
    checkStructureDoNotHaveValign(editor);
  });
});
