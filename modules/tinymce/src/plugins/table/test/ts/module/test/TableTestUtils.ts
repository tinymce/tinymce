/*
 NOTE: This file is partially duplicated in the following locations:
  - models/dom/test/module/table/TableTestUtils.ts
  - core/test/module/TableUtils.ts
 Make sure that if making changes to this file, the other files are updated as well
 */

import { ApproxStructure, Assertions, Cursors, Mouse, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { Arr, Obj } from '@ephox/katamari';
import { Attribute, Checked, Class, Insert, SelectorFind, SugarBody, SugarElement, TextContent, Value } from '@ephox/sugar';
import { TinyDom, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

export interface WidthData {
  readonly raw: number | null;
  readonly px: number;
  readonly unit: string | null;
  readonly isPercent: boolean;
}

const advSelectors = {
  borderwidth: 'label.tox-label:contains(Border width) + input.tox-textfield',
  borderstyle: 'label.tox-label:contains(Border style) + div.tox-listboxfield > .tox-listbox',
  bordercolor: 'label.tox-label:contains(Border color) + div>input.tox-textfield',
  backgroundcolor: 'label.tox-label:contains(Background color) + div>input.tox-textfield'
};

const assertTableStructure = (editor: Editor, structure: StructAssert): void => {
  const table = SelectorFind.descendant(TinyDom.body(editor), 'table').getOrDie('A table should exist');
  Assertions.assertStructure('Should be a table the expected structure', structure, table);
};

const openContextToolbarOn = (editor: Editor, selector: string, path: number[]): void => {
  const elem = UiFinder.findIn(TinyDom.body(editor), selector).getOrDie();
  const target = Cursors.follow(elem, path).getOrDie();
  editor.selection.select(target.dom);
  Mouse.click(target);
};

const pOpenTableDialog = async (editor: Editor): Promise<void> => {
  await Waiter.pTryUntil('Click table properties toolbar button',
    () => TinyUiActions.clickOnToolbar(editor, 'button:not(.tox-tbtn--disabled)')
  );
  await TinyUiActions.pWaitForDialog(editor);
};

const assertApproxElementStructure = (editor: Editor, selector: string, expected: StructAssert): void => {
  const body = editor.getBody();
  body.normalize(); // consolidate text nodes
  const target = SelectorFind.descendant(TinyDom.body(editor), selector).getOrDie('Nothing in the editor matches selector: ' + selector);

  Assertions.assertStructure(
    'Asserting HTML structure of the element: ' + selector,
    expected,
    target
  );
};

const assertElementStructure = (editor: Editor, selector: string, expected: string): void =>
  assertApproxElementStructure(editor, selector, ApproxStructure.fromHtml(expected));

const pClickDialogButton = async (editor: Editor, isSave: boolean): Promise<void> => {
  const close = isSave ? TinyUiActions.submitDialog : TinyUiActions.cancelDialog;
  close(editor);
  await Waiter.pTryUntil(
    'Waiting for the dialog to go away',
    () => UiFinder.notExists(SugarBody.body(), '.tox-dialog')
  );
};

const pAssertDialogPresence = async (label: string, editor: Editor, expected: Record<string, number>): Promise<void> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  Assertions.assertPresence(
    label,
    expected,
    dialog
  );
};

const pAssertListBoxValue = async (label: string, editor: Editor, section: string, expected: string): Promise<void> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  const elem = UiFinder.findIn(dialog, 'label:contains("' + section + '") + .tox-listboxfield > .tox-listbox').getOrDie();
  const value = Attribute.get(elem, 'data-value');
  assert.equal(value, expected, 'Checking listbox: ' + label);
};

const getInput = (selector: string) =>
  UiFinder.findIn<HTMLInputElement>(SugarBody.body(), selector).getOrDie();

const assertInputValue = (label: string, selector: string, expected: string | boolean): void => {
  const input = getInput(selector);
  if (input.dom.type === 'checkbox') {
    assert.equal(input.dom.checked, expected, `The input value for ${label} should be: ${expected}`);
  } else if (Class.has(input, 'tox-listbox')) {
    assert.equal(Attribute.get(input, 'data-value'), String(expected), `The input value for ${label} should be: ${expected}`);
  } else {
    assert.equal(Value.get(input), expected, `The input value for ${label} should be: ${expected}`);
  }
};

const setInputValue = (selector: string, value: string | boolean): void => {
  const input = getInput(selector);
  if (input.dom.type === 'checkbox') {
    Checked.set(input, value as boolean);
  } else if (Class.has(input, 'tox-listbox')) {
    Attribute.set(input, 'data-value', value);
  } else {
    Value.set(input, value as string);
  }
};

const gotoGeneralTab = (): void => {
  Mouse.clickOn(SugarBody.body(), 'div.tox-tab:contains(General)');
};

const gotoAdvancedTab = (): void => {
  Mouse.clickOn(SugarBody.body(), 'div.tox-tab:contains(Advanced)');
};

const setTabInputValues = (data: Record<string, any>, tabSelectors: Record<string, string>): void => {
  Obj.mapToArray(tabSelectors, (value, key) => {
    if (Obj.has(data, key)) {
      setInputValue(tabSelectors[key], data[key]);
    }
  });
};

const setDialogValues = (data: Record<string, any>, hasAdvanced: boolean, generalSelectors: Record<string, string>): void => {
  if (hasAdvanced) {
    gotoGeneralTab();
    setTabInputValues(data, generalSelectors);
    gotoAdvancedTab();
    setTabInputValues(data, advSelectors);
  } else {
    setTabInputValues(data, generalSelectors);
  }
};

const assertTabContents = (data: Record<string, any>, tabSelectors: Record<string, string>): void => {
  Obj.mapToArray(tabSelectors, (value, key) => {
    if (Obj.has(data, key)) {
      assertInputValue(key, value, data[key]);
    }
  });
};

const assertDialogValues = (data: Record<string, any>, hasAdvanced: boolean, generalSelectors: Record<string, string>): void => {
  if (hasAdvanced) {
    gotoGeneralTab();
    assertTabContents(data, generalSelectors);
    gotoAdvancedTab();
    assertTabContents(data, advSelectors);
  } else {
    assertTabContents(data, generalSelectors);
  }
};

const pInsertTableViaGrid = async (editor: Editor, cols: number, rows: number): Promise<void> => {
  TinyUiActions.clickOnMenu(editor, 'span:contains("Table")');
  await Waiter.pTryUntil('click table menu', () =>
    TinyUiActions.clickOnUi(editor, 'div.tox-menu div.tox-collection__item .tox-collection__item-label:contains("Table")')
  );
  const gridSelector = (cols - 1) + (10 * (rows - 1));
  await Waiter.pTryUntil('click table grid', () =>
    TinyUiActions.clickOnUi(editor, `div.tox-insert-table-picker div[role="button"]:nth(${gridSelector})`)
  );
};

const createTableChildren = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, withColGroups: boolean): StructAssert[] => {
  const style = {
    width: str.contains('%')
  };

  const styleNone = {
    width: str.none()
  };

  const columns = s.element('colgroup', {
    children: [
      s.element('col', {
        styles: style
      }),
      s.element('col', {
        styles: style
      })
    ]
  });

  const tbody = s.element('tbody', {
    children: [
      s.element('tr', {
        children: [
          s.element('td', {
            styles: withColGroups ? styleNone : style,
            children: [
              s.element('br', {})
            ]
          }),
          s.element('td', {
            styles: withColGroups ? styleNone : style,
            children: [
              s.element('br', {})
            ]
          })
        ]
      }),
      s.element('tr', {
        children: [
          s.element('td', {
            styles: withColGroups ? styleNone : style,
            children: [
              s.element('br', {})
            ]
          }),
          s.element('td', {
            styles: withColGroups ? styleNone : style,
            children: [
              s.element('br', {})
            ]
          })
        ]
      })
    ]
  });

  return withColGroups ? [ columns, tbody ] : [ tbody ];
};

const createRow = (cellContents: string[]): SugarElement<HTMLTableRowElement> => {
  const tr = SugarElement.fromTag('tr');
  Arr.each(cellContents, (content) => {
    const td = SugarElement.fromTag('td');
    TextContent.set(td, content);
    Insert.append(tr, td);
  });

  return tr;
};

export {
  pAssertDialogPresence,
  pAssertListBoxValue,
  openContextToolbarOn,
  assertTableStructure,
  createTableChildren,
  pInsertTableViaGrid,
  pOpenTableDialog,
  gotoAdvancedTab,
  assertDialogValues,
  setInputValue,
  setDialogValues,
  pClickDialogButton,
  assertElementStructure,
  assertApproxElementStructure,
  createRow
};
