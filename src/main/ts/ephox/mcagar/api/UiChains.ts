import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { NamedChain } from '@ephox/agar';
import { Mouse } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { Arr } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Visibility } from '@ephox/sugar';


export default function(
  toolBarSelector = '.mce-toolbar-grp',
  menuBarSelector = '.mce-menubar',
  dialogCloseSelector = 'div[role="button"]:contains(Cancel)',
  dialogSubmitSelector = 'div[role="button"].mce-primary') {

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
    UiFinder.cFindIn(toolBarSelector)
  ]);

  var cGetMenuRoot = Chain.fromChains([
    cToolstripRoot,
    UiFinder.cFindIn(menuBarSelector)
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
    var popupId = input.popupNode.dom().id;
    var dialogs =  Arr.filter(wins, function (dialog) {
      return popupId === dialog._id;
    });
    return dialogs.length ? Result.value(dialogs[0]) : Result.error("dialog with id of: " + popupId + " was not found");
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
        Assertions.assertEq('asserting contents of: ' + selector, data, dialog.toJSON());
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
        dialog.fromJSON(Merger.merge(dialog.toJSON(), data));
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
    return cClickPopupButton(dialogCloseSelector, selector);
  };

  var cSubmitDialog = function (selector?: string) {
    return cClickPopupButton(dialogSubmitSelector, selector);
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