import { Chain, Mouse, NamedChain, UiFinder } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { Element, Visibility, Body } from '@ephox/sugar';
import { getThemeSelectors } from './ThemeSelectors';

const cToolstripRoot = Chain.mapper(function (editor: any) {
  return Element.fromDom(editor.getContainer());
});

const cEditorRoot = Chain.mapper(function (editor: any) {
  return Element.fromDom(editor.getBody());
});

const cDialogRoot = Chain.injectThunked(Body.body);

const cGetToolbarRoot = Chain.fromChains([
  cToolstripRoot,
  Chain.binder((container: Element) => {
    return UiFinder.findIn(container, getThemeSelectors().toolBarSelector);
  })
]);

const cGetMenuRoot = Chain.fromChains([
  cToolstripRoot,
  Chain.binder((container: Element) => {
    return UiFinder.findIn(container, getThemeSelectors().menuBarSelector);
  })
]);

const cClickOnWithin = function (label: string, selector: string, cContext) {
    return NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), cContext, 'context'),
      NamedChain.direct('context', UiFinder.cFindIn(selector), 'ui'),
      NamedChain.direct('ui', Mouse.cClick, '_'),
      NamedChain.outputInput
    ]);
  };

const cClickOnUi = function (label: string, selector: string) {
  return cClickOnWithin(label, selector, cDialogRoot);
};

const cClickOnToolbar = function (label: string, selector: string) {
  return cClickOnWithin(label, selector, cGetToolbarRoot);
};

const cClickOnMenu = function (label: string, selector: string) {
  return cClickOnWithin(label, selector, cGetMenuRoot);
};

const cWaitForState = function (hasState) {
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

const cWaitForVisible = function (label: string, selector: string) {
  return Chain.fromChains([
    cDialogRoot,
    UiFinder.cWaitForState(label, selector, Visibility.isVisible)
  ]);
};

const cWaitForPopup = function (label: string, selector: string) {
  return cWaitForState(Visibility.isVisible)(label, selector);
};

const cWaitForUi = function (label: string, selector: string) {
  return cWaitForState(Fun.constant(true))(label, selector);
};

const cTriggerContextMenu = function (label: string, target, menu) {
  return Chain.fromChains([
    cEditorRoot,
    UiFinder.cFindIn(target),
    Mouse.cContextMenu,

    // Ignores input
    cWaitForPopup(label, menu)
  ]);
};

const cClickPopupButton = function (btnType: string, selector?: string) {
  const popupSelector = selector ? selector : '[role="dialog"]';

  return NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), cWaitForVisible('waiting for: ' + popupSelector, popupSelector), 'popup'),
    NamedChain.direct('popup', Chain.binder((container) => UiFinder.findIn(container, getThemeSelectors()[btnType])), 'button'),
    NamedChain.direct('button', Mouse.cClick, '_'),
    NamedChain.outputInput
  ]);
};

const cCloseDialog = (selector: string) => {
  return cClickPopupButton('dialogCloseSelector', selector);
};

const cSubmitDialog = (selector?: string) => {
  return cClickPopupButton('dialogSubmitSelector', selector);
};

export default {
  cClickOnToolbar,
  cClickOnMenu,
  cClickOnUi,

  // Popups need to be visible.
  cWaitForPopup,
  // UI does not need to be visible
  cWaitForUi,
  // General state predicate
  cWaitForState,

  cCloseDialog,
  cSubmitDialog,

  cTriggerContextMenu
};
