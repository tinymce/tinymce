import { Assertions, Keys, Waiter } from '@ephox/agar';
import { Arr, Fun } from '@ephox/katamari';
import { TinyAssertions, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

interface AssertStyleOptions {
  readonly menuTitle: string;
  readonly subMenuTitle: string;
  readonly subMenuRemoveTitle: string;
  readonly rows: number;
  readonly columns: number;
  readonly customStyle: string;
}

interface AssertStyleOptionsWithCheckmarks extends AssertStyleOptions {
  readonly checkMarkEntries: number;
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
                Arr.range(columns, Fun.constant('<td>Filler</td>')).join('') +
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

const closeMenu = (editor: Editor) => {
  TinyUiActions.keydown(editor, Keys.escape());
  TinyUiActions.keydown(editor, Keys.escape());
};

const clickOnButton = (editor: Editor, title: string) => {
  TinyUiActions.clickOnToolbar(editor, `button[title="${title}"]`);
};

const pClickOnMenuItem = async (editor: Editor, title: string) => {
  TinyUiActions.clickOnMenu(editor, 'span:contains("Table")');
  await TinyUiActions.pWaitForUi(editor, `div[title="${title}"]`);
  TinyUiActions.clickOnUi(editor, `div[title="${title}"]`);
};

const pAssertMenuPresence = async (editor: Editor, label: string, menuTitle: string, expected: Record<string, number>, container: SugarElement<HTMLElement>, useMenuOrToolbar: 'toolbar' | 'menuitem') => {
  if (useMenuOrToolbar === 'toolbar') {
    clickOnButton(editor, menuTitle);
  } else {
    await pClickOnMenuItem(editor, menuTitle);
  }
  await Waiter.pTryUntil('Ensure the correct values are present', () =>
    Assertions.assertPresence(label, expected, container)
  );
  closeMenu(editor);
};

const pAssertCheckmarkOn = async (editor: Editor, menuTitle: string, itemTitle: string, unchecked: number, sugarContainer: SugarElement<HTMLElement>, useMenuOrToolbar: 'toolbar' | 'menuitem') => {
  const expected = {
    '.tox-menu': useMenuOrToolbar === 'toolbar' ? 1 : 2,
    [`.tox-collection__item[aria-checked="true"][title="${itemTitle}"]`]: 1,
    '.tox-collection__item[aria-checked="false"]': unchecked,
    '.tox-collection__item[aria-checked="true"]': 1,
  };
  await pAssertMenuPresence(editor, 'There should be a checkmark', menuTitle, expected, sugarContainer, useMenuOrToolbar);
};

const pClickOnSubMenu = async (editor: Editor, menuTitle: string, itemTitle: string, useMenuOrToolbar: 'toolbar' | 'menuitem') => {
  if (useMenuOrToolbar === 'toolbar') {
    clickOnButton(editor, menuTitle);
  } else {
    await pClickOnMenuItem(editor, menuTitle);
  }
  await TinyUiActions.pWaitForUi(editor, `div[title="${itemTitle}"]`);
  TinyUiActions.clickOnUi(editor, `div[title="${itemTitle}"]`);
  closeMenu(editor);
};

const pAssertNoCheckmarksInMenu = async (editor: Editor, menuTitle: string, expectedFalseCheckmarks: number, container: SugarElement<HTMLElement>, useMenuOrToolbar: 'toolbar' | 'menuitem') => {
  const expected = {
    '.tox-menu': useMenuOrToolbar === 'toolbar' ? 1 : 2,
    '.tox-collection__item[aria-checked="true"]': 0,
    '.tox-collection__item[aria-checked="false"]': expectedFalseCheckmarks,
  };

  await pAssertMenuPresence(editor, 'Menu should open, but not have any checkmarks', menuTitle, expected, container, useMenuOrToolbar);
};

const pAssertStyleCanBeToggledWithoutCheckmarks = async (editor: Editor, options: AssertStyleOptions, useMenuOrToolbar: 'toolbar' | 'menuitem') => {
  setEditorContentTableAndSelection(editor, options.columns, options.rows);

  await pClickOnSubMenu(editor, options.menuTitle, options.subMenuTitle, useMenuOrToolbar);
  assertStructureHasCustomStyle(editor, options.columns, options.rows, options.customStyle);

  await pClickOnSubMenu(editor, options.menuTitle, options.subMenuRemoveTitle, useMenuOrToolbar);
  assertStructureIsRestoredToDefault(editor, options.columns, options.rows);
};

const pAssertStyleCanBeToggled = async (editor: Editor, options: AssertStyleOptionsWithCheckmarks, useMenuOrToolbar: 'toolbar' | 'menuitem') => {
  const sugarContainer = SugarBody.body();
  setEditorContentTableAndSelection(editor, options.rows, options.columns);
  await pAssertNoCheckmarksInMenu(editor, options.menuTitle, options.checkMarkEntries, sugarContainer, useMenuOrToolbar);

  await pClickOnSubMenu(editor, options.menuTitle, options.subMenuTitle, useMenuOrToolbar);
  await pAssertCheckmarkOn(editor, options.menuTitle, options.subMenuTitle, options.checkMarkEntries - 1, sugarContainer, useMenuOrToolbar);
  assertStructureHasCustomStyle(editor, options.rows, options.columns, options.customStyle);

  await pClickOnSubMenu(editor, options.menuTitle, options.subMenuRemoveTitle, useMenuOrToolbar);
  await pAssertNoCheckmarksInMenu(editor, options.menuTitle, options.checkMarkEntries, sugarContainer, useMenuOrToolbar);
  assertStructureIsRestoredToDefault(editor, options.rows, options.columns);
};

const pAssertStyleCanBeToggledOnAndOff = async (editor: Editor, options: AssertStyleOptionsWithCheckmarks) => {
  await pAssertStyleCanBeToggled(editor, options, 'toolbar');
  await pAssertStyleCanBeToggled(editor, options, 'menuitem');
};

const pAssertStyleCanBeToggledOnAndOffWithoutCheckmarks = async (editor: Editor, options: AssertStyleOptions) => {
  await pAssertStyleCanBeToggledWithoutCheckmarks(editor, options, 'toolbar');
  await pAssertStyleCanBeToggledWithoutCheckmarks(editor, options, 'menuitem');
};

const makeCell = (type: string, content: string, hasScope?: boolean, isSelected?: boolean, isStart?: boolean, isEnd?: boolean) => {
  const getSelection = () => {
    const attributes: string[] = [ '' ];

    if (isSelected) {
      if (isStart) {
        attributes.push('data-mce-first-selected="1"');
      }

      if (isEnd) {
        attributes.push('data-mce-last-selected="1"');
      }

      attributes.push('data-mce-selected="1"');
    }

    return attributes.join(' ');
  };

  const getScope = () => {
    if (hasScope) {
      return ' scope="col"';
    } else {
      return '';
    }
  };

  return `<${type}${getScope()}${getSelection()}>Cell ${content}</${type}>`;
};

export {
  pAssertStyleCanBeToggledOnAndOff,
  pAssertStyleCanBeToggledOnAndOffWithoutCheckmarks,
  setEditorContentTableAndSelection,
  pAssertNoCheckmarksInMenu,
  pAssertMenuPresence,
  clickOnButton,
  pClickOnMenuItem,
  assertStructureIsRestoredToDefault,
  makeCell
};
