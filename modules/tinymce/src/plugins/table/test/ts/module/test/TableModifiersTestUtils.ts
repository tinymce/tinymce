import { Assertions, Keys, Waiter } from '@ephox/agar';
import { Arr, Optional } from '@ephox/katamari';
import { TinyAssertions, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

interface AssertStyleOptions {
  menuTitle: string;
  subMenuTitle: string;
  checkMarkEntries: number;
  rows: number;
  columns: number;
  customStyle: string;
}

const setEditorContentTableAndSelection = (editor: Editor, rows: number, columns: number) => {
  const getSelectionStartEnd = (row: number, column: number) => {
    if (row === 0 && column === 0) {
      return 'data-mce-first-selected="1"';
    } else if (row === (rows - 1) && column === (columns - 1)) {
      return 'data-mce-last-selected="1"';
    } else {
      return '';
    }
  };

  editor.setContent(
    '<table>' +
      '<tbody>' +
        Arr.range(rows, (row) => {
          return (
            '<tr>' +
                Arr.range(columns, (column) => {
                  return `<td data-mce-selected="1" ${getSelectionStartEnd(row, column)}>Filler</td>`;
                }).join('') +
            '</tr>'
          );
        }).join('') +
      '</tbody>' +
    '</table>'
  );

  TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
};

const assertStructureIsRestoredToDefault = (editor: Editor, rows: number, columns: number) => {
  TinyAssertions.assertContent(editor,
    '<table>' +
      '<tbody>' +
        Arr.range(rows, () => {
          return (
            '<tr>' +
                Arr.range(columns, () => {
                  return '<td>Filler</td>';
                }).join('') +
            '</tr>'
          );
        }).join('') +
      '</tbody>' +
    '</table>');
};

const assertStructureHasCustomStyle = (editor: Editor, rows: number, columns: number, expectedStyle: string) => {
  TinyAssertions.assertContent(editor,
    '<table>' +
      '<tbody>' +
        Arr.range(rows, () => {
          return (
            '<tr>' +
                Arr.range(columns, () => {
                  return `<td style="${expectedStyle};">Filler</td>`;
                }).join('') +
            '</tr>'
          );
        }).join('') +
      '</tbody>' +
    '</table>');
};

const closeMenu = (editor) =>
  TinyUiActions.keydown(editor, Keys.escape());

const clickOnToolbarButton = (editor: Editor, title: string) =>
  TinyUiActions.clickOnToolbar(editor, `button[title="${title}"]`);

const pAssertMenuPresence = async (editor: Editor, label: string, menuTitle: string, expected: Record<string, number>, container: SugarElement<HTMLElement>) => {
  clickOnToolbarButton(editor, menuTitle);
  await Waiter.pTryUntil('Ensure the correct values are present', () =>
    Assertions.assertPresence(label, expected, container)
  );
  closeMenu(editor);
};

const pAssertCheckmarkOn = async (editor: Editor, menuTitle: string, itemTitle: string, unchecked: number, sugarContainer: SugarElement<HTMLElement>) => {
  const expected = {
    '.tox-menu': 1,
    [`.tox-collection__item[aria-checked="true"][title="${itemTitle}"]`]: 1,
    '.tox-collection__item[aria-checked="false"]': unchecked,
    '.tox-collection__item[aria-checked="true"]': 1,
  };
  await pAssertMenuPresence(editor, 'There should be a checkmark', menuTitle, expected, sugarContainer);
};

const pClickOnSubMenu = async (editor: Editor, menuTitle: string, itemTitle: Optional<string>) => {
  clickOnToolbarButton(editor, menuTitle);
  await TinyUiActions.pWaitForUi(editor, `div[title="${itemTitle.getOr('None')}"]`);
  TinyUiActions.clickOnUi(editor, `div[title="${itemTitle.getOr('None')}"]`);
  closeMenu(editor);
};

const pAssertNoCheckmarksInMenu = async (editor: Editor, menuTitle: string, expectedFalseCheckmarks: number, container: SugarElement<HTMLElement>) => {
  const expected = {
    '.tox-menu': 1,
    '.tox-collection__item[aria-checked="true"]': 0,
    '.tox-collection__item[aria-checked="false"]': expectedFalseCheckmarks,
  };

  await pAssertMenuPresence(editor, 'Menu should open, but not have any checkmarks', menuTitle, expected, container);
};

const pAssertStyleCanBeToggledOnAndOff = async (editor: Editor, options: AssertStyleOptions) => {
  const sugarContainer = SugarBody.body();
  setEditorContentTableAndSelection(editor, options.rows, options.columns);
  await pAssertNoCheckmarksInMenu(editor, options.menuTitle, options.checkMarkEntries, sugarContainer);

  await pClickOnSubMenu(editor, options.menuTitle, Optional.some(options.subMenuTitle));
  await pAssertCheckmarkOn(editor, options.menuTitle, options.subMenuTitle, options.checkMarkEntries - 1, sugarContainer);
  assertStructureHasCustomStyle(editor, options.rows, options.columns, options.customStyle);

  await pClickOnSubMenu(editor, options.menuTitle, Optional.none());
  await pAssertNoCheckmarksInMenu(editor, options.menuTitle, options.checkMarkEntries, sugarContainer);
  assertStructureIsRestoredToDefault(editor, options.rows, options.columns);
};

export {
  pAssertStyleCanBeToggledOnAndOff,
  setEditorContentTableAndSelection,
  pAssertNoCheckmarksInMenu,
  pAssertMenuPresence,
  clickOnToolbarButton,
  assertStructureIsRestoredToDefault
};
