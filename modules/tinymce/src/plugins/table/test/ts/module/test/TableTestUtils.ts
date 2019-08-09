import { ApproxStructure, Assertions, Chain, Cursors, GeneralSteps, Guard, Logger, Mouse, NamedChain, Step, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { document, HTMLElement } from '@ephox/dom-globals';
import { Obj } from '@ephox/katamari';
import { TinyDom } from '@ephox/mcagar';
import { Body, Element, SelectorFind, Value, Attr, Html } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const sAssertTableStructure = (editor, structure) => Logger.t('Assert table structure ' + structure, Step.sync(() => {
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

const sOpenTableDialog = Logger.t('Open table dialog', GeneralSteps.sequence([
  Waiter.sTryUntil('Click table properties toolbar button',
    Mouse.sClickOn(TinyDom.fromDom(document.body), '.tox-toolbar button:not(.tox-tbtn--disabled)'),
    50, 1000
  ),
  UiFinder.sWaitForVisible('wait for dialog', TinyDom.fromDom(document.body), '.tox-dialog[role="dialog"]'),
]));

const sAssertElementStructure = (editor, selector, expected) => {
  return Logger.t('Assert HTML structure of the element ' + expected, Step.sync(() => {
    const body = editor.getBody();
    body.normalize(); // consolidate text nodes

    Assertions.assertStructure(
      'Asserting HTML structure of the element: ' + selector,
      ApproxStructure.fromHtml(expected),
      SelectorFind.descendant(Element.fromDom(body), selector).getOrDie('Nothing in the Editor matches selector: ' + selector)
    );
  }));
};

const sAssertApproxElementStructure = (editor, selector, expected) => {
  return Logger.t('Assert HTML structure of the element ' + expected, Step.sync(() => {
    const body = editor.getBody();
    body.normalize(); // consolidate text nodes

    Assertions.assertStructure(
      'Asserting HTML structure of the element: ' + selector,
      expected,
      SelectorFind.descendant(Element.fromDom(body), selector).getOrDie('Nothing in the Editor matches selector: ' + selector)
    );
  }));
};

const sClickDialogButton = (label: string, isSave: boolean) => Logger.t('Close dialog and wait to confirm dialog goes away', GeneralSteps.sequence([
  Mouse.sClickOn(TinyDom.fromDom(document.body), '[role="dialog"].tox-dialog button:contains("' + (isSave ? 'Save' : 'Cancel') + '")'),
  Waiter.sTryUntil(
    'Waiting for confirm dialog to go away',
    UiFinder.sNotExists(TinyDom.fromDom(document.body), '.tox-confirm-dialog'),
    100,
    1000
  )
]));

const cSetInputValue = (section, newValue) =>  Chain.control(
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

const cInsertTable = (cols: number, rows: number) => {
  return Chain.mapper((editor: Editor) => {
    return TinyDom.fromDom(editor.plugins.table.insertTable(cols, rows));
  });
};

const cInsertRaw = (html: string) => {
  return Chain.mapper((editor: Editor) => {
    const element = Element.fromHtml<HTMLElement>(html);
    Attr.set(element, 'data-mce-id', '__mce');
    editor.insertContent(Html.getOuter(element));

    return SelectorFind.descendant(Element.fromDom(editor.getBody()), '[data-mce-id="__mce"]').map((el) => {
      Attr.remove(el, 'data-mce-id');
      return el;
    }).getOrDie();
  });
};

const cMergeCells = (keys) => Chain.control(
  Chain.mapper((editor: any) => {
    keys(editor);
    editor.execCommand('mceTableMergeCells');
  }),
  Guard.addLogging('Merge cells')
);

const cSplitCells = Chain.control(
  Chain.mapper((editor: any) => {
    editor.execCommand('mceTableSplitCells');
  }),
  Guard.addLogging('Split cells')
);

const cInsertColumnBefore = Chain.control(
  Chain.mapper((editor: any) => {
    editor.execCommand('mceTableInsertColBefore');
  }),
  Guard.addLogging('Insert column before selected column')
);

const cInsertColumnAfter = Chain.control(
  Chain.mapper((editor: any) => {
    editor.execCommand('mceTableInsertColAfter');
  }),
  Guard.addLogging('Insert column after selected column')
);

const cDeleteColumn = Chain.control(
  Chain.mapper((editor: any) => {
    editor.execCommand('mceTableDeleteCol');
  }),
  Guard.addLogging('Delete column')
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
    const rawWidth = editor.dom.getStyle(elm, 'width');
    const pxWidth = editor.dom.getStyle(elm, 'width', true);
    return {
      raw: parseFloat(rawWidth),
      px: parseInt(pxWidth, 10),
      isPercent: /%$/.test(rawWidth)
    };
  }),
  Guard.addLogging('Get width')
);

const cGetInput = (selector: string) => Chain.control(
  Chain.fromChains([
    Chain.inject(Body.body()),
    UiFinder.cFindIn(selector)
  ]),
  Guard.addLogging('Get input')
);

const sAssertInputValue = (label, selector, expected) => {
  return Logger.t(label,
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
};

const sSetInputValue = (label, selector, value) => {
  return Logger.t(label,
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
};

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

export default {
  sAssertDialogPresence,
  sAssertSelectValue,
  sChooseTab,
  sOpenToolbarOn,
  sAssertTableStructure,
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
  cInsertColumnBefore,
  cInsertColumnAfter,
  cDeleteColumn
};