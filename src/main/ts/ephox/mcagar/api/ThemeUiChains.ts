import { Assertions, Chain, Mouse, NamedChain, UiFinder } from '@ephox/agar';
import { document } from '@ephox/dom-globals';
import { Fun, Merger, Result } from '@ephox/katamari';
import { Element, Visibility } from '@ephox/sugar';
import { DefaultThemeSelectors, ThemeSelectors } from './ThemeSelectors';

export default function() {
  const selectors: ThemeSelectors = DefaultThemeSelectors;

  var dialogRoot = Element.fromDom(document.body);

  var cToolstripRoot = Chain.mapper(function (editor: any) {
    return Element.fromDom(editor.getContainer());
  });

  var cEditorRoot = Chain.mapper(function (editor: any) {
    return Element.fromDom(editor.getBody());
  });

  var cDialogRoot = Chain.inject(dialogRoot);

  var cGetToolbarRoot = Chain.fromChains([
    cToolstripRoot,
    UiFinder.cFindIn(selectors.toolBarSelector)
  ]);

  var cGetMenuRoot = Chain.fromChains([
    cToolstripRoot,
    UiFinder.cFindIn(selectors.menuBarSelector)
  ]);

  var cFindIn = function (cRoot, selector: string) {
    return Chain.fromChains([
      cRoot,
      UiFinder.cFindIn(selector)
    ]);
  };

  var cClickOnWithin = function (label: string, selector: string, cContext) {
     return NamedChain.asChain([
       NamedChain.direct(NamedChain.inputName(), cContext, 'context'),
       NamedChain.direct('context', UiFinder.cFindIn(selector), 'ui'),
       NamedChain.direct('ui', Mouse.cClick, '_'),
       NamedChain.outputInput
     ]);
   };

  var cClickOnUi = function (label: string, selector: string) {
   return cClickOnWithin(label, selector, cDialogRoot);
  };

  var cClickOnToolbar = function (label: string, selector: string) {
    return cClickOnWithin(label, selector, cGetToolbarRoot);
  };

  var cClickOnMenu = function (label: string, selector: string) {
    return cClickOnWithin(label, selector, cGetMenuRoot);
  };

  var cWaitForState = function (hasState) {
    return function (label: string, selector: string) {
      return NamedChain.asChain([
        NamedChain.write('element', Chain.fromChains([
          cDialogRoot,
          UiFinder.cWaitForState(label, selector, hasState)
        ])),
        NamedChain.outputInput
      ]);
    };
  };

  var cWaitForVisible = function (label: string, selector: string) {
    return Chain.fromChains([
      cDialogRoot,
      UiFinder.cWaitForState(label, selector, Visibility.isVisible)
    ]);
  };

  var cWaitForPopup = function (label: string, selector: string) {
    return cWaitForState(Visibility.isVisible)(label, selector);
  };

  var cWaitForUi = function (label: string, selector: string) {
    return cWaitForState(Fun.constant(true))(label, selector);
  };

  var cTriggerContextMenu = function (label: string, target, menu) {
    return Chain.fromChains([
      cEditorRoot,
      UiFinder.cFindIn(target),
      Mouse.cContextMenu,

      // Ignores input
      cWaitForPopup(label, menu)
    ]);
  };

  var cDialogByPopup = Chain.binder(function (input: any) {
    var wins = input.editor.windowManager.getWindows();
    // TODO: fix this to work properly with alloy dialogs
    return wins.length ? Result.value(wins[0]) : Result.error("dialog was not found");
  });

  var cWaitForDialog = function (selector: string) {
    return NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      NamedChain.write('popupNode', cWaitForVisible('waiting for popup: ' + selector, selector)),
      NamedChain.merge(['editor', 'popupNode'], 'dialogInputs'),
      NamedChain.direct('dialogInputs', cDialogByPopup, 'dialog'),
      NamedChain.output('dialog')
    ]);
  };

  var cAssertDialogContents = function (selector: string, data) {
    return NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), cWaitForDialog(selector), 'dialog'),
      NamedChain.direct('dialog', Chain.op(function (dialog) {
        Assertions.assertEq('asserting contents of: ' + selector, data, dialog.getData());
      }), '_'),
      NamedChain.outputInput
    ]);
  };

  var cAssertActiveDialogContents = function (data) {
    return cAssertDialogContents('[role="dialog"]', data);
  };

  var cFillDialog = function (selector: string, data) {
    return NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), cWaitForDialog(selector), 'dialog'),
      NamedChain.direct('dialog', Chain.op(function (dialog) {
        dialog.setData(Merger.merge(dialog.getData(), data));
      }), '_'),
      NamedChain.outputInput
    ]);
  };

  var cFillActiveDialog = function (data) {
    return cFillDialog('[role="dialog"]', data);
  };

  var cClickPopupButton = function (btnSelector: string, selector?: string) {
    var popupSelector = selector ? selector : '[role="dialog"]';

    return NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), cWaitForVisible('waiting for: ' + popupSelector, popupSelector), 'popup'),
      NamedChain.direct('popup', UiFinder.cFindIn(btnSelector), 'button'),
      NamedChain.direct('button', Mouse.cClick, '_'),
      NamedChain.outputInput
    ]);
  };

  var cCloseDialog = function (selector: string) {
    return cClickPopupButton(selectors.dialogCloseSelector, selector);
  };

  var cSubmitDialog = function (selector?: string) {
    return cClickPopupButton(selectors.dialogSubmitSelector, selector);
  };

  return {
    cClickOnToolbar: cClickOnToolbar,
    cClickOnMenu: cClickOnMenu,
    cClickOnUi: cClickOnUi,

    // Popups need to be visible.
    cWaitForPopup: cWaitForPopup,
    // UI does not need to be visible
    cWaitForUi: cWaitForUi,
    // General state predicate
    cWaitForState: cWaitForState,

    cFillDialog: cFillDialog,
    cFillActiveDialog: cFillActiveDialog,
    cCloseDialog: cCloseDialog,
    cSubmitDialog: cSubmitDialog,
    cAssertDialogContents: cAssertDialogContents,
    cAssertActiveDialogContents: cAssertActiveDialogContents,

    cTriggerContextMenu: cTriggerContextMenu
  };
}