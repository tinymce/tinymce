import { Pipeline, Mouse, UiFinder, Chain, Assertions, ApproxStructure, FocusTools, Keyboard, Keys, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader } from '@ephox/mcagar';
import { document } from '@ephox/dom-globals';

import Theme from 'tinymce/themes/silver/Theme';
import { Body, Element } from '@ephox/sugar';
import { Menu } from '@ephox/bridge';

const tableCellsApprox = (s, arr, selectedRows, selectedCols) => {
  const cells = [];
  for (let i = 1; i <= 10; i++) {
    for (let j = 1; j <= 10; j++) {
      cells.push(s.element('div', {
        role: 'button',
        classes: i <= selectedRows && j <= selectedCols ? [ arr.has('tox-insert-table-picker__selected') ] : [ arr.not('tox-insert-table-picker__selected')]
      }));
    }
  }
  return cells;
};

const insertTablePickerApprox = (s, str, arr, selectedRows, selectedCols) =>
  s.element('div', {
    classes: [ arr.has('tox-menu'), arr.has('tox-collection'), arr.has('tox-collection--list') ],
    children: [
      s.element('div', {
        classes: [ arr.has('tox-collection__group')],
        children: [
          s.element('div', {
            classes: [arr.has('tox-menu-nav__js'), arr.has('tox-fancymenuitem'), arr.not('tox-collection__item')],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-insert-table-picker')],
                children: tableCellsApprox(s, arr, selectedRows, selectedCols).concat(s.element('span', {
                  classes: [arr.has('tox-insert-table-picker__label')],
                  html: str.is(`${selectedCols}x${selectedRows}`)
                }))
              })
            ]
          })
        ]
      })
    ]
  });

UnitTest.asynctest('OxideTablePickerMenuTest', (success, failure) => {
  Theme();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const doc = Element.fromDom(document);

      Pipeline.async({ }, Log.steps(
        'TBA',
        'Check structure of table picker',
        [
          Mouse.sClickOn(Body.body(), '.tox-toolbar button'),
          UiFinder.sWaitForVisible('Waiting for menu', Body.body(), '[role="menu"]'),
          Chain.asStep(Body.body(), [
            UiFinder.cFindIn('[role="menu"]'),
            Assertions.cAssertStructure(
              'Checking structure',
              ApproxStructure.build((s, str, arr) => insertTablePickerApprox(s, str, arr, 1, 1))
            )
          ]),
          FocusTools.sTryOnSelector('Focus should be on first table cell', doc, '.tox-insert-table-picker__selected:last'),
          Keyboard.sKeydown(doc, Keys.down(), {}),
          Keyboard.sKeydown(doc, Keys.right(), {}),
          Chain.asStep(Body.body(), [
            UiFinder.cFindIn('[role="menu"]'),
            Assertions.cAssertStructure(
              'Checking structure',
              ApproxStructure.build((s, str, arr) => insertTablePickerApprox(s, str, arr, 2, 2))
            )
          ]),
          FocusTools.sTryOnSelector('Focus should be on 2 down, 2 across table cell', doc, '.tox-insert-table-picker__selected:last')
        ]
      ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      menubar: true,
      toolbar: 'table-button',
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed) => {
        ed.ui.registry.addMenuButton('table-button', {
          type: 'menubutton',
          fetch: (callback) => {
            callback([
              {
                type: 'fancymenuitem',
                fancytype: 'inserttable'
              } as Menu.FancyMenuItemApi
            ]);
          }
        });
      }
    },
    success,
    failure
  );
});