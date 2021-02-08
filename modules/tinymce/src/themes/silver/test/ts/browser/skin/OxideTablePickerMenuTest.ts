import { ApproxStructure, Assertions, FocusTools, Keys, StructAssert } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarDocument } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

const tableCellsApprox = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi, selectedRows: number, selectedCols: number) => {
  const cells: StructAssert[] = [];
  for (let i = 1; i <= 10; i++) {
    for (let j = 1; j <= 10; j++) {
      cells.push(s.element('div', {
        attrs: {
          role: str.is('button')
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
    toolbar: 'table-button',
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addMenuButton('table-button', {
        type: 'menubutton',
        fetch: (callback) => {
          callback([
            {
              type: 'fancymenuitem',
              fancytype: 'inserttable',
              onAction: Fun.noop
            }
          ]);
        }
      });
    }
  }, [ Theme ]);

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
  });
});
