import { ApproxStructure, Assertions, Chain, Cursors, GeneralSteps, Guard, Logger, Mouse, NamedChain, Step, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { document } from '@ephox/dom-globals';
import { TinyDom } from '@ephox/mcagar';
import { Body, Element, SelectorFind, Value } from '@ephox/sugar';

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
  Mouse.sClickOn(TinyDom.fromDom(document.body), '.tox-toolbar button'),
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

const cInsertTable = function (cols, rows) {
  return Chain.mapper(function (editor: any) {
    return TinyDom.fromDom(editor.plugins.table.insertTable(cols, rows));
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

const sCheckInputValue = (Label, selector, expected) => {
  return Logger.t(Label,
    Chain.asStep({}, [
      cGetInput(selector),
      Chain.op((element) => {
        Assertions.assertEq(`The input value for ${Label} should be: `, expected, Value.get(element));
      })
    ]),
  );
};

const sSetInputValue = (Label, selector, value) => {
  return Logger.t(Label,
    Chain.asStep({}, [
      cGetInput(selector),
      Chain.op((element) => {
        Value.set(element, value);
      })
    ]),
  );
};

const sGotoAdvancedTab = Chain.asStep({}, [
  Chain.inject(Body.body()),
  UiFinder.cFindIn('div.tox-tab:contains(Advanced)'),
  Mouse.cClick
]);

export default {
  sAssertDialogPresence,
  sAssertSelectValue,
  sChooseTab,
  sOpenToolbarOn,
  sAssertTableStructure,
  sOpenTableDialog,
  sGotoAdvancedTab,
  sCheckInputValue,
  sSetInputValue,
  sClickDialogButton,
  sAssertElementStructure,
  sAssertApproxElementStructure,
  cSetInputValue,
  cWaitForDialog,
  cGetBody,
  cInsertTable,
  cMergeCells,
  cSplitCells,
  cDragHandle,
  cGetWidth
};