import {
  ApproxStructure, Assertions, Chain, Cursors, GeneralSteps, Guard, Log, Logger, Mouse, NamedChain, Step, StructAssert, UiControls, UiFinder, Waiter
} from '@ephox/agar';
import { Assert } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { TinyApis, TinyDom, TinyUi } from '@ephox/mcagar';
import { Attribute, Checked, Class, Html, SelectorFilter, SelectorFind, SugarBody, SugarElement, Value } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

interface Options {
  headerRows: number;
  headerCols: number;
}

const getRawWidth = (editor: Editor, elm: HTMLElement) => {
  const style = editor.dom.getStyle(elm, 'width');
  if (style) {
    return style;
  } else {
    const attr = editor.dom.getAttrib(elm, 'width');
    return attr ? attr + 'px' : attr;
  }
};

const getWidths = (editor: Editor, elm: HTMLElement) => {
  const rawWidth = getRawWidth(editor, elm);
  const pxWidth = editor.dom.getStyle(elm, 'width', true);
  const unit = rawWidth === '' ? null : /\d+(\.\d+)?(%|px)/.exec(rawWidth)[2];
  return {
    raw: rawWidth === '' ? null : parseFloat(rawWidth),
    px: parseInt(pxWidth, 10),
    unit,
    isPercent: unit === '%'
  };
};

const assertWidth = (editor: Editor, elm: HTMLElement, expectedWidth: number | null, expectedUnit: string | null) => {
  const widthData = getWidths(editor, elm);
  const nodeName = elm.nodeName.toLowerCase();
  if (expectedWidth === null) {
    Assert.eq(`${nodeName} width should not be set`, null, widthData.raw);
  } else {
    Assert.eq(`${nodeName} width is ${expectedWidth} ~= ${widthData.raw}`, true, Math.abs(widthData.raw - expectedWidth) <= 2);
  }
  Assert.eq(`${nodeName} unit is ${expectedUnit}`, expectedUnit, widthData.unit);
};

const sAssertTableStructure = (editor: Editor, structure: StructAssert) => Logger.t('Assert table structure', Step.sync(() => {
  const table = SelectorFind.descendant(SugarElement.fromDom(editor.getBody()), 'table').getOrDie('Should exist a table');
  Assertions.assertStructure('Should be a table the expected structure', structure, table);
}));

const sOpenToolbarOn = function (editor, selector, path) {
  return Logger.t('Open dialog from toolbar', Chain.asStep(TinyDom.fromDom(editor.getBody()), [
    UiFinder.cFindIn(selector),
    Cursors.cFollow(path),
    Chain.op(function (target) {
      editor.selection.select(target.dom);
    }),
    Mouse.cClick
  ]));
};

const sOpenTableDialog = (ui: TinyUi) => Logger.t('Open table dialog', GeneralSteps.sequence([
  Waiter.sTryUntil('Click table properties toolbar button',
    ui.sClickOnToolbar('Click on toolbar button', 'button:not(.tox-tbtn--disabled)'),
    50, 1000
  ),
  UiFinder.sWaitForVisible('wait for dialog', TinyDom.fromDom(document.body), '.tox-dialog[role="dialog"]')
]));

const sAssertElementStructure = (editor, selector, expected) => Logger.t('Assert HTML structure of the element ' + expected, Step.sync(() => {
  const body = editor.getBody();
  body.normalize(); // consolidate text nodes

  Assertions.assertStructure(
    'Asserting HTML structure of the element: ' + selector,
    ApproxStructure.fromHtml(expected),
    SelectorFind.descendant(SugarElement.fromDom(body), selector).getOrDie('Nothing in the Editor matches selector: ' + selector)
  );
}));

const sAssertApproxElementStructure = (editor, selector, expected) => Logger.t('Assert HTML structure of the element ' + expected, Step.sync(() => {
  const body = editor.getBody();
  body.normalize(); // consolidate text nodes

  Assertions.assertStructure(
    'Asserting HTML structure of the element: ' + selector,
    expected,
    SelectorFind.descendant(SugarElement.fromDom(body), selector).getOrDie('Nothing in the Editor matches selector: ' + selector)
  );
}));

const sClickDialogButton = (label: string, isSave: boolean) => Logger.t('Close dialog and wait to confirm dialog goes away', GeneralSteps.sequence([
  Mouse.sClickOn(TinyDom.fromDom(document.body), '[role="dialog"].tox-dialog button:contains("' + (isSave ? 'Save' : 'Cancel') + '")'),
  Waiter.sTryUntil(
    'Waiting for confirm dialog to go away',
    UiFinder.sNotExists(TinyDom.fromDom(document.body), '.tox-confirm-dialog'),
    100,
    1000
  )
]));

const cSetInputValue = (section, newValue) => Chain.control(
  Chain.fromChains([
    UiFinder.cFindIn(`label:contains(${section}) + div > input`),
    UiControls.cSetValue(newValue)
  ]),
  Guard.addLogging('Set input value' + newValue)
);

const cWaitForDialog = Chain.control(
  Chain.fromChains([
    Chain.inject(SugarBody.body()),
    UiFinder.cWaitFor('Waiting for dialog', '[role="dialog"]')
  ]),
  Guard.addLogging('Wait for dialog to be visible')
);

const sChooseTab = (tabName: string) => Logger.t('Choose tab ' + tabName, Chain.asStep(SugarBody.body(), [
  cWaitForDialog,
  UiFinder.cFindIn(`[role="tab"]:contains(${tabName})`),
  Mouse.cClick
]));

const sAssertDialogPresence = (label, expected) => Logger.t('Assert dialog is present', Chain.asStep({}, [
  cWaitForDialog,
  Chain.op(function (dialog) {
    Assertions.assertPresence(
      label,
      expected,
      dialog
    );
  })
]));

const sAssertSelectValue = (label, section, expected) => Logger.t('Assert selected value ' + expected, Chain.asStep({}, [
  cWaitForDialog,
  UiFinder.cFindIn('label:contains("' + section + '") + .tox-selectfield select'),
  UiControls.cGetValue,
  Assertions.cAssertEq('Checking select: ' + label, expected)
]));

const sAssertListBoxValue = (label, section, expected) => Logger.t('Assert selected value ' + expected, Chain.asStep({}, [
  cWaitForDialog,
  UiFinder.cFindIn('label:contains("' + section + '") + .tox-listboxfield > .tox-listbox'),
  Chain.mapper((elem) => Attribute.get(elem, 'data-value')),
  Assertions.cAssertEq('Checking listbox: ' + label, expected)
]));

const cGetBody = Chain.control(
  Chain.mapper(function (editor: any) {
    return TinyDom.fromDom(editor.getBody());
  }),
  Guard.addLogging('Get body')
);

const cGetDoc = Chain.control(
  Chain.mapper((editor: Editor) => SugarElement.fromDom(editor.getDoc().documentElement)),
  Guard.addLogging('Get doc')
);

const cInsertTable = (cols: number, rows: number) => Chain.mapper((editor: Editor) => TinyDom.fromDom(editor.plugins.table.insertTable(cols, rows)));

const cInsertRaw = (html: string) => Chain.mapper((editor: Editor) => {
  const element = SugarElement.fromHtml<HTMLElement>(html);
  Attribute.set(element, 'data-mce-id', '__mce');
  editor.insertContent(Html.getOuter(element));

  return SelectorFind.descendant(SugarElement.fromDom(editor.getBody()), '[data-mce-id="__mce"]').map((el) => {
    Attribute.remove(el, 'data-mce-id');
    return el;
  }).getOrDie();
});

const cMergeCells = (keys) => Chain.control(
  Chain.mapper((editor: Editor) => {
    keys(editor);
    editor.execCommand('mceTableMergeCells');
  }),
  Guard.addLogging('Merge cells')
);

const cSplitCells = Chain.control(
  Chain.mapper((editor: Editor) => {
    editor.execCommand('mceTableSplitCells');
  }),
  Guard.addLogging('Split cells')
);

const cInsertColumnBefore = Chain.control(
  Chain.mapper((editor: Editor) => {
    editor.execCommand('mceTableInsertColBefore');
  }),
  Guard.addLogging('Insert column before selected column')
);

const cInsertColumnAfter = Chain.control(
  Chain.mapper((editor: Editor) => {
    editor.execCommand('mceTableInsertColAfter');
  }),
  Guard.addLogging('Insert column after selected column')
);

const cDeleteColumn = Chain.control(
  Chain.mapper((editor: Editor) => {
    editor.execCommand('mceTableDeleteCol');
  }),
  Guard.addLogging('Delete column')
);

const cInsertRowBefore = Chain.control(
  Chain.mapper((editor: Editor) => {
    editor.execCommand('mceTableInsertRowBefore');
  }),
  Guard.addLogging('Insert row before selected row')
);

const cInsertRowAfter = Chain.control(
  Chain.mapper((editor: Editor) => {
    editor.execCommand('mceTableInsertRowAfter');
  }),
  Guard.addLogging('Insert row after selected row')
);

const cDeleteRow = Chain.control(
  Chain.mapper((editor: Editor) => {
    editor.execCommand('mceTableDeleteRow');
  }),
  Guard.addLogging('Delete row')
);

const cDragHandle = function (id, deltaH, deltaV) {
  return Chain.control(
    NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      NamedChain.direct('editor', cGetBody, 'editorBody'),
      NamedChain.read('editorBody', Chain.control(
        UiFinder.cFindIn('#mceResizeHandle' + id),
        Guard.tryUntil('wait for resize handlers', 100, 40000)
      )),
      NamedChain.read('editorBody', Chain.fromChains([
        UiFinder.cFindIn('#mceResizeHandle' + id),
        Mouse.cMouseDown,
        Mouse.cMouseMoveTo(deltaH, deltaV),
        Mouse.cMouseUp
      ])),
      NamedChain.outputInput
    ]),
    Guard.addLogging('Drag handle')
  );
};

const cDragResizeBar = (rowOrCol: 'row' | 'column', index: number, dx: number, dy: number) =>
  Chain.control(
    NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      NamedChain.direct('editor', cGetBody, 'editorBody'),
      // Need to mouse over the table to trigger the 'resizebar' divs to appear in the dom
      NamedChain.read('editorBody', Chain.fromChains([
        UiFinder.cFindIn('td'),
        Mouse.cMouseOver
      ])),
      NamedChain.direct('editor', cGetDoc, 'editorDoc'),
      NamedChain.read('editorDoc', Chain.fromChains([
        UiFinder.cFindIn(`div[data-${rowOrCol}='${index}']`),
        Mouse.cMouseDown
      ])),
      NamedChain.read('editorDoc', Chain.fromChains([
        UiFinder.cFindIn('div.ephox-dragster-blocker'),
        Mouse.cMouseMove,
        Mouse.cMouseMoveTo(dx, dy),
        Mouse.cMouseUpTo(dx, dy)
      ])),
      NamedChain.outputInput
    ]),
    Guard.addLogging(`Drag ${rowOrCol} ${index} resizer`)
  );

const cGetWidth = Chain.control(
  Chain.mapper(function (input: any) {
    const editor = input.editor;
    const elm = input.element.dom;
    return getWidths(editor, elm);
  }),
  Guard.addLogging('Get table width')
);

const getCellWidth = (editor: Editor, table: SugarElement<HTMLTableElement>, rowNumber: number, columnNumber: number) => {
  const row = SelectorFilter.descendants<HTMLTableRowElement>(table, 'tr')[rowNumber];
  const cell = SelectorFilter.descendants<HTMLTableCellElement>(row, 'th,td')[columnNumber];
  return getWidths(editor, cell.dom);
};

const cGetCellWidth = (rowNumber: number, columnNumber: number) => Chain.control(
  Chain.mapper((input: any) => {
    const editor = input.editor;
    const elm = input.element;
    return getCellWidth(editor, elm, rowNumber, columnNumber);
  }),
  Guard.addLogging('Get cell width')
);


const cGetInput = (selector: string) => Chain.control(
  Chain.fromChains([
    Chain.inject(SugarBody.body()),
    UiFinder.cFindIn(selector)
  ]),
  Guard.addLogging('Get input')
);

const sAssertInputValue = (label, selector, expected) => Logger.t(label,
  Chain.asStep({}, [
    cGetInput(selector),
    Chain.op((element) => {
      if (element.dom.type === 'checkbox') {
        Assertions.assertEq(`The input value for ${label} should be: `, expected, element.dom.checked);
      } else if (Class.has(element, 'tox-listbox')) {
        Assertions.assertEq(`The input value for ${label} should be: `, expected, Attribute.get(element, 'data-value'));
      } else {
        Assertions.assertEq(`The input value for ${label} should be: `, expected, Value.get(element));
      }
    })
  ]),
);

const sSetInputValue = (label, selector, value) => Logger.t(label,
  Chain.asStep({}, [
    cGetInput(selector),
    Chain.op((element) => {
      if (element.dom.type === 'checkbox') {
        Checked.set(element, value);
      } else if (Class.has(element, 'tox-listbox')) {
        Attribute.set(element, 'data-value', value);
      } else {
        Value.set(element, value);
      }
    })
  ]),
);

const sGotoGeneralTab = Chain.asStep({}, [
  Chain.inject(SugarBody.body()),
  UiFinder.cFindIn('div.tox-tab:contains(General)'),
  Mouse.cClick
]);

const sGotoAdvancedTab = Chain.asStep({}, [
  Chain.inject(SugarBody.body()),
  UiFinder.cFindIn('div.tox-tab:contains(Advanced)'),
  Mouse.cClick
]);

const advSelectors = {
  borderstyle: 'label.tox-label:contains(Border style) + div.tox-listboxfield > .tox-listbox',
  bordercolor: 'label.tox-label:contains(Border color) + div>input.tox-textfield',
  backgroundcolor: 'label.tox-label:contains(Background color) + div>input.tox-textfield'
};

const sSetTabInputValues = (data, tabSelectors) => {
  const steps = [];
  Obj.mapToArray(tabSelectors, (value, key) => {
    if (Obj.has(data, key)) {
      steps.push(sSetInputValue(key, tabSelectors[key], data[key]));
    }
  });
  return GeneralSteps.sequence(steps);
};

const sSetDialogValues = (data, hasAdvanced, generalSelectors) => {
  if (hasAdvanced) {
    return GeneralSteps.sequence([
      sGotoGeneralTab,
      sSetTabInputValues(data, generalSelectors),
      sGotoAdvancedTab,
      sSetTabInputValues(data, advSelectors)
    ]);
  }
  return sSetTabInputValues(data, generalSelectors);
};

const sAssertTabContents = (data, tabSelectors) => {
  const steps = [];
  Obj.mapToArray(tabSelectors, (value, key) => {
    if (Obj.has(data, key)) {
      steps.push(sAssertInputValue(key, value, data[key]));
    }
  });
  return GeneralSteps.sequence(steps);
};

const sAssertDialogValues = (data, hasAdvanced, generalSelectors) => {
  if (hasAdvanced) {
    return GeneralSteps.sequence([
      sGotoGeneralTab,
      sAssertTabContents(data, generalSelectors),
      sGotoAdvancedTab,
      sAssertTabContents(data, advSelectors)
    ]);
  }
  return sAssertTabContents(data, generalSelectors);
};

const sInsertTable = (editor: Editor, args) =>
  Logger.t('Insert table ', Step.sync(() =>
    editor.execCommand('mceInsertTable', false, args)));

const sAssertTableStructureWithSizes = (
  editor: Editor,
  cols: number,
  rows: number,
  unit: string | null,
  tableWidth: number | null,
  widths: Array<number | null>[],
  useColGroups: boolean,
  options: Options = { headerRows: 0, headerCols: 0 }
): Step<any, any> => {

  const tableWithColGroup = Step.sync(() => {
    const table = editor.dom.select('table')[0];
    assertWidth(editor, table, tableWidth, unit);
    const row = editor.dom.select('colgroup', table)[0];
    Arr.each(widths[0], (columnWidth, columnIndex) => {
      const column = editor.dom.select('col', row)[columnIndex];
      assertWidth(editor, column, columnWidth, unit);
    });
  });

  const tableWithoutColGroup = Step.sync(() => {
    const table = editor.dom.select('table')[0];
    assertWidth(editor, table, tableWidth, unit);
    Arr.each(widths, (rowWidths, rowIndex) => {
      const row = editor.dom.select('tr', table)[rowIndex];
      Arr.each(rowWidths, (cellWidth, cellIndex) => {
        const cell = editor.dom.select('td,th', row)[cellIndex];
        assertWidth(editor, cell, cellWidth, unit);
      });
    });
  });

  const asserTableStructure = sAssertTableStructure(editor, ApproxStructure.build((s, str) => {
    const tbody = s.element('tbody', {
      children: Arr.range(rows, (rowIndex) =>
        s.element('tr', {
          children: Arr.range(cols, (colIndex) =>
            s.element(colIndex < options.headerCols || rowIndex < options.headerRows ? 'th' : 'td', {
              children: [
                s.either([
                  s.element('br', { }),
                  s.text(str.contains('Cell'))
                ])
              ]
            })
          )
        })
      )
    });

    const colGroup = s.element('colgroup', {
      children: Arr.range(cols, () =>
        s.element('col', {})
      )
    });

    return s.element('table', {
      attrs: { border: str.is('1') },
      styles: { 'border-collapse': str.is('collapse') },
      children: useColGroups ? [ colGroup, tbody ] : [ tbody ]
    });
  }));

  return GeneralSteps.sequence(useColGroups ? [ asserTableStructure, tableWithColGroup ] : [ asserTableStructure, tableWithoutColGroup ]);
};

const sMakeInsertTable = (editor: Editor, cols: number, rows: number) =>
  Logger.t('Insert table ' + cols + 'x' + rows, Step.sync(() => {
    editor.plugins.table.insertTable(cols, rows);
  }));

const sInsertTableTest = (editor, tinyApis: TinyApis, id: string, tableColumns: number, tableRows: number, widths: number[][], withColGroups: boolean) =>
  Log.stepsAsStep(id, `Table: Insert table ${tableColumns}x${tableRows}`, [
    tinyApis.sSetContent(''),
    sMakeInsertTable(editor, tableColumns, tableRows),
    sAssertTableStructureWithSizes(editor, tableColumns, tableRows, '%', 100, widths, withColGroups),
    tinyApis.sAssertSelection([ 0, withColGroups ? 1 : 0, 0, 0 ], 0, [ 0, withColGroups ? 1 : 0, 0, 0 ], 0)
  ]);

const createTableChildren = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, withColGroups: boolean) => {
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

export {
  getCellWidth,
  sAssertDialogPresence,
  sAssertSelectValue,
  sAssertListBoxValue,
  sChooseTab,
  sOpenToolbarOn,
  sAssertTableStructure,
  sAssertTableStructureWithSizes,
  createTableChildren,
  sInsertTableTest,
  sOpenTableDialog,
  sGotoGeneralTab,
  sGotoAdvancedTab,
  sAssertInputValue,
  sAssertDialogValues,
  sSetInputValue,
  sSetDialogValues,
  sClickDialogButton,
  sAssertElementStructure,
  sAssertApproxElementStructure,
  cSetInputValue,
  cWaitForDialog,
  cGetBody,
  cGetDoc,
  cInsertTable,
  cInsertRaw,
  cMergeCells,
  cSplitCells,
  cDragHandle,
  cDragResizeBar,
  cGetWidth,
  cGetCellWidth,
  cInsertColumnBefore,
  cInsertColumnAfter,
  cDeleteColumn,
  cInsertRowBefore,
  cInsertRowAfter,
  cDeleteRow,
  sInsertTable
};
