import { ApproxStructure, Assertions, FocusTools, Keys, Mouse, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

const tableCellsApprox = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi, selectedRows: number, selectedCols: number) => {
  const cells: StructAssert[] = [];
  for (let i = 1; i <= 10; i++) {
    for (let j = 1; j <= 10; j++) {
      cells.push(s.element('div', {
        attrs: {
          role: str.is('button'),
          ['aria-label']: str.is(`${j} columns, ${i} rows`)
        },
        classes: i <= selectedRows && j <= selectedCols ? [ arr.has('tox-insert-table-picker__selected') ] : [ arr.not('tox-insert-table-picker__selected') ]
      }));
    }
  }
  return cells;
};

const insertTablePickerApprox = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi, selectedRows: number, selectedCols: number) =>
  s.element('div', {
    classes: [ arr.has('tox-menu'), arr.has('tox-collection'), arr.has('tox-collection--list') ],
    children: [
      s.element('div', {
        classes: [ arr.has('tox-collection__group') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-menu-nav__js'), arr.has('tox-fancymenuitem'), arr.not('tox-collection__item') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-insert-table-picker') ],
                children: tableCellsApprox(s, str, arr, selectedRows, selectedCols).concat(s.element('span', {
                  classes: [ arr.has('tox-insert-table-picker__label') ],
                  html: str.is(`${selectedCols}x${selectedRows}`)
                }))
              })
            ]
          })
        ]
      })
    ]
  });

describe('browser.tinymce.themes.silver.skin.OxideTablePickerMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    menubar: 'table',
    menu: {
      table: { title: 'Table', items: 'table-menuitem' }
    },
    toolbar: 'table-button',
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      const tableMenuItem: Menu.FancyMenuItemSpec = {
        type: 'fancymenuitem',
        fancytype: 'inserttable',
        onAction: Fun.noop
      };

      ed.ui.registry.addMenuButton('table-button', {
        icon: 'table',
        fetch: (callback) => callback([ tableMenuItem ])
      });

      ed.ui.registry.addNestedMenuItem('table-menuitem', {
        text: 'Insert table',
        getSubmenuItems: () => [ tableMenuItem ]
      });
    }
  }, [], true);

  it('TBA: Check structure of table picker', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    TinyUiActions.clickOnToolbar(editor, 'button');
    const menu = await TinyUiActions.pWaitForPopup(editor, '[role="menu"]');
    Assertions.assertStructure(
      'Checking structure',
      ApproxStructure.build((s, str, arr) => insertTablePickerApprox(s, str, arr, 1, 1)),
      menu
    );
    await FocusTools.pTryOnSelector('Focus should be on first table cell', doc, '.tox-insert-table-picker__selected:last');
    TinyUiActions.keydown(editor, Keys.down());
    TinyUiActions.keydown(editor, Keys.right());
    Assertions.assertStructure(
      'Checking structure',
      ApproxStructure.build((s, str, arr) => insertTablePickerApprox(s, str, arr, 2, 2)),
      menu
    );
    await FocusTools.pTryOnSelector('Focus should be on 2 down, 2 across table cell', doc, '.tox-insert-table-picker__selected:last');
    TinyUiActions.keyup(editor, Keys.escape());
  });

  it('TINY-6532: Re-opening the menu should reset the selected cells', async () => {
    const editor = hook.editor();

    const pOpenTablePicker = async () => {
      const insertTableMenuItem = await TinyUiActions.pWaitForPopup(editor, '[role="menuitem"]:contains("Insert table")');
      Mouse.mouseOver(insertTableMenuItem);
      return await TinyUiActions.pWaitForPopup(editor, 'div.tox-fancymenuitem');
    };

    TinyUiActions.clickOnMenu(editor, 'button:contains("Table")');
    const firstPicker = await pOpenTablePicker();
    const item = UiFinder.findIn(firstPicker, 'div[role="button"]').getOrDie();
    Mouse.mouseOver(item);
    UiFinder.exists(firstPicker, 'div.tox-insert-table-picker__selected');
    UiFinder.exists(firstPicker, 'span.tox-insert-table-picker__label:contains("1x1")');

    TinyUiActions.keyup(editor, Keys.escape());
    await Waiter.pTryUntil('Wait for menu to be hidden', () => UiFinder.notExists(SugarBody.body(), 'div.tox-fancymenuitem'));

    const secondPicker = await pOpenTablePicker();
    UiFinder.notExists(secondPicker, 'div.tox-insert-table-picker__selected');
    UiFinder.exists(secondPicker, 'span.tox-insert-table-picker__label:contains("0x0")');
    TinyUiActions.keyup(editor, Keys.escape());
    TinyUiActions.keyup(editor, Keys.escape());
  });
});
