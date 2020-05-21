import {
  ApproxStructure, Assertions, Chain, Cursors, GeneralSteps, Guard, Logger, Mouse, NamedChain, Step, StructAssert, UiControls, UiFinder, Waiter
} from '@ephox/agar';
import { Assert } from '@ephox/bedrock-client';
import { document, HTMLElement, HTMLTableCellElement, HTMLTableRowElement } from '@ephox/dom-globals';
import { Arr, Obj } from '@ephox/katamari';
import { TinyDom, TinyUi } from '@ephox/mcagar';
import { Attr, Body, Element, Html, SelectorFilter, SelectorFind, Value } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

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
  const table = SelectorFind.descendant(Element.fromDom(editor.getBody()), 'table').getOrDie('Should exist a table');
  Assertions.assertStructure('Should be a table the expected structure', structure, table);
}));

const sOpenToolbarOn = function (editor, selector, path) {
  return Logger.t('Open dialog from toolbar', Chain.asStep(TinyDom.fromDom(editor.getBody()), [
    UiFinder.cFindIn(selector),
    Cursors.cFollow(path),
    Chain.op(function (target) {
      editor.selection.select(target.dom());
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
    SelectorFind.descendant(Element.fromDom(body), selector).getOrDie('Nothing in the Editor matches selector: ' + selector)
  );
}));

const sAssertApproxElementStructure = (editor, selector, expected) => Logger.t('Assert HTML structure of the element ' + expected, Step.sync(() => {
  const body = editor.getBody();
  body.normalize(); // consolidate text nodes

  Assertions.assertStructure(
    'Asserting HTML structure of the element: ' + selector,
    expected,
    SelectorFind.descendant(Element.fromDom(body), selector).getOrDie('Nothing in the Editor matches selector: ' + selector)
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
    Chain.inject(Body.body()),
    UiFinder.cWaitFor('Waiting for dialog', '[role="dialog"]')
  ]),
  Guard.addLogging('Wait for dialog to be visible')
);

const sChooseTab = (tabName: string) => Logger.t('Choose tab ' + tabName, Chain.asStep(Body.body(), [
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

const cGetBody = Chain.control(
  Chain.mapper(function (editor: any) {
    return TinyDom.fromDom(editor.getBody());
  }),
  Guard.addLogging('Get body')
);

const cInsertTable = (cols: number, rows: number) => Chain.mapper((editor: Editor) => TinyDom.fromDom(editor.plugins.table.insertTable(cols, rows)));

const cInsertRaw = (html: string) => Chain.mapper((editor: Editor) => {
  const element = Element.fromHtml<HTMLElement>(html);
  Attr.set(element, 'data-mce-id', '__mce');
  editor.insertContent(Html.getOuter(element));

  return SelectorFind.descendant(Element.fromDom(editor.getBody()), '[data-mce-id="__mce"]').map((el) => {
    Attr.remove(el, 'data-mce-id');
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

const cGetWidth = Chain.control(
  Chain.mapper(function (input: any) {
    const editor = input.editor;
    const elm = input.element.dom();
    return getWidths(editor, elm);
  }),
  Guard.addLogging('Get table width')
);

const cGetCellWidth = (rowNumber: number, columnNumber: number) => Chain.control(
  Chain.mapper((input: any) => {
    const editor = input.editor;
    const elm = input.element;
    const row = SelectorFilter.descendants<HTMLTableRowElement>(elm, 'tr')[rowNumber];
    const cell = SelectorFilter.descendants<HTMLTableCellElement>(row, 'th,td')[columnNumber];
    return getWidths(editor, cell.dom());
  }),
  Guard.addLogging('Get cell width')
);


const cGetInput = (selector: string) => Chain.control(
  Chain.fromChains([
    Chain.inject(Body.body()),
    UiFinder.cFindIn(selector)
  ]),
  Guard.addLogging('Get input')
);

const sAssertInputValue = (label, selector, expected) => Logger.t(label,
  Chain.asStep({}, [
    cGetInput(selector),
    Chain.op((element) => {
      if (element.dom().type === 'checkbox') {
        Assertions.assertEq(`The input value for ${label} should be: `, expected, element.dom().checked);
        return;
      }
      Assertions.assertEq(`The input value for ${label} should be: `, expected, Value.get(element));
    })
  ]),
);

const sSetInputValue = (label, selector, value) => Logger.t(label,
  Chain.asStep({}, [
    cGetInput(selector),
    Chain.op((element) => {
      if (element.dom().type === 'checkbox') {
        element.dom().checked = value;
        return;
      }
      Value.set(element, value);
    })
  ]),
);

const sGotoGeneralTab = Chain.asStep({}, [
  Chain.inject(Body.body()),
  UiFinder.cFindIn('div.tox-tab:contains(General)'),
  Mouse.cClick
]);

const sGotoAdvancedTab = Chain.asStep({}, [
  Chain.inject(Body.body()),
  UiFinder.cFindIn('div.tox-tab:contains(Advanced)'),
  Mouse.cClick
]);

const advSelectors = {
  borderstyle: 'label.tox-label:contains(Border style) + div.tox-selectfield>select',
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

const sAssertTableStructureWithSizes = (editor: Editor, cols: number, rows: number, unit: string | null, tableWidth: number | null, widths: Array<number | null>[],
                                        options: { headerRows: number; headerCols: number } = { headerRows: 0, headerCols: 0 }) => GeneralSteps.sequence([
  sAssertTableStructure(editor, ApproxStructure.build((s, str) => s.element('table', {
    attrs: { border: str.is('1') },
    styles: { 'border-collapse': str.is('collapse') },
    children: [
      s.element('tbody', {
        children: Arr.range(rows, (rowIndex) => s.element('tr', {
          children: Arr.range(cols, (colIndex) => s.element(colIndex < options.headerCols || rowIndex < options.headerRows ? 'th' : 'td', {
            children: [
              s.either([
                s.element('br', { }),
                s.text(str.contains('Cell'))
              ])
            ]
          }))
        }))
      })
    ]
  }))),
  Step.sync(() => {
    const table = editor.dom.select('table')[0];
    assertWidth(editor, table, tableWidth, unit);
    Arr.each(widths, (rowWidths, rowIndex) => {
      const row = editor.dom.select('tr', table)[rowIndex];
      Arr.each(rowWidths, (cellWidth, cellIndex) => {
        const cell = editor.dom.select('td,th', row)[cellIndex];
        assertWidth(editor, cell, cellWidth, unit);
      });
    });
  })
]);

export {
  sAssertDialogPresence,
  sAssertSelectValue,
  sChooseTab,
  sOpenToolbarOn,
  sAssertTableStructure,
  sAssertTableStructureWithSizes,
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
  cInsertTable,
  cInsertRaw,
  cMergeCells,
  cSplitCells,
  cDragHandle,
  cGetWidth,
  cGetCellWidth,
  cInsertColumnBefore,
  cInsertColumnAfter,
  cDeleteColumn,
  cInsertRowBefore,
  cInsertRowAfter,
  cDeleteRow
};
