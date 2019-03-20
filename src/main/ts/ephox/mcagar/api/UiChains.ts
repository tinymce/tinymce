import { Chain, Mouse, NamedChain, UiFinder } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { Element, Visibility, Body } from '@ephox/sugar';
import { getThemeSelectors } from './ThemeSelectors';

var cToolstripRoot = Chain.mapper(function (editor: any) {
  return Element.fromDom(editor.getContainer());
});

var cEditorRoot = Chain.mapper(function (editor: any) {
  return Element.fromDom(editor.getBody());
});

var cDialogRoot = Chain.injectThunked(Body.body);

var cGetToolbarRoot = Chain.fromChains([
  cToolstripRoot,
  Chain.binder((container: Element) => {
    return UiFinder.findIn(container, getThemeSelectors().toolBarSelector);
  })
]);

var cGetMenuRoot = Chain.fromChains([
  cToolstripRoot,
  Chain.binder((container: Element) => {
    return UiFinder.findIn(container, getThemeSelectors().menuBarSelector);
  })
]);

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

var cClickPopupButton = function (btnType: string, selector?: string) {
  var popupSelector = selector ? selector : '[role="dialog"]';

  return NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), cWaitForVisible('waiting for: ' + popupSelector, popupSelector), 'popup'),
    NamedChain.direct('popup', Chain.binder((container) => UiFinder.findIn(container, getThemeSelectors()[btnType])), 'button'),
    NamedChain.direct('button', Mouse.cClick, '_'),
    NamedChain.outputInput
  ]);
};

var cCloseDialog = (selector: string) => {
  return cClickPopupButton('dialogCloseSelector', selector);
};

var cSubmitDialog = (selector?: string) => {
  return cClickPopupButton('dialogSubmitSelector', selector);
};

export default {
  cClickOnToolbar: cClickOnToolbar,
  cClickOnMenu: cClickOnMenu,
  cClickOnUi: cClickOnUi,

  // Popups need to be visible.
  cWaitForPopup: cWaitForPopup,
  // UI does not need to be visible
  cWaitForUi: cWaitForUi,
  // General state predicate
  cWaitForState: cWaitForState,

  cCloseDialog: cCloseDialog,
  cSubmitDialog: cSubmitDialog,

  cTriggerContextMenu: cTriggerContextMenu
};