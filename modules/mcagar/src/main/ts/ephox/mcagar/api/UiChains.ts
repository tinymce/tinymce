import { Chain, Mouse, NamedChain, UiFinder } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { SugarBody, SugarElement, Visibility } from '@ephox/sugar';
import { Editor } from '../alien/EditorTypes';
import { getThemeSelectors } from './ThemeSelectors';

export interface UiChains {
  cClickOnToolbar: <T extends Editor> (label: string, selector: string) => Chain<T, T>;
  cClickOnMenu: <T extends Editor> (label: string, selector: string) => Chain<T, T>;
  cClickOnUi: <T> (label: string, selector: string) => Chain<T, T>;

  cWaitForPopup: <T> (label: string, selector: string) => Chain<T, T>;
  cWaitForUi: <T> (label: string, selector: string) => Chain<T, T>;
  cWaitForState: <T> (hasState: (element: SugarElement) => boolean) => (label: string, selector: string) => Chain<T, T>;

  cCloseDialog: <T> (selector: string) => Chain<T, T>;
  cSubmitDialog: <T> (selector?: string) => Chain<T, T>;

  cTriggerContextMenu: <T extends Editor> (label: string, target: string, menu: string) => Chain<T, T>;
}

const cToolstripRoot = Chain.mapper(function (editor: Editor) {
  return SugarElement.fromDom(editor.getContainer());
});

const cEditorRoot = Chain.mapper(function (editor: Editor) {
  return SugarElement.fromDom(editor.getBody());
});

const cDialogRoot = Chain.injectThunked(SugarBody.body);

const cGetToolbarRoot: Chain<Editor, SugarElement> = NamedChain.asChain([
  NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
  NamedChain.direct('editor', cToolstripRoot, 'container'),
  NamedChain.merge([ 'editor', 'container' ], 'data'),
  NamedChain.direct('data', Chain.binder((data: { editor: Editor; container: SugarElement<HTMLElement> }) => UiFinder.findIn(data.container, getThemeSelectors().toolBarSelector(data.editor))), 'toolbar'),
  NamedChain.output('toolbar')
]);

const cGetMenuRoot = Chain.fromChains<Editor, SugarElement>([
  cToolstripRoot,
  Chain.binder((container: SugarElement) => UiFinder.findIn(container, getThemeSelectors().menuBarSelector))
]);

const cClickOnWithin = function <T> (label: string, selector: string, cContext: Chain<T, SugarElement>): Chain<T, T> {
  return NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), cContext, 'context'),
    NamedChain.direct('context', UiFinder.cFindIn(selector), 'ui'),
    NamedChain.direct('ui', Mouse.cClick, '_'),
    NamedChain.outputInput
  ]);
};

const cClickOnUi = function <T> (label: string, selector: string) {
  return cClickOnWithin<T>(label, selector, cDialogRoot);
};

const cClickOnToolbar = function <T extends Editor> (label: string, selector: string) {
  return cClickOnWithin<T>(label, selector, cGetToolbarRoot);
};

const cClickOnMenu = function <T extends Editor> (label: string, selector: string) {
  return cClickOnWithin<T>(label, selector, cGetMenuRoot);
};

const cWaitForState = function <T> (hasState: (element: SugarElement) => boolean) {
  return function (label: string, selector: string): Chain<T, T> {
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

const cWaitForPopup = function <T> (label: string, selector: string) {
  return cWaitForState<T>(Visibility.isVisible)(label, selector);
};

const cWaitForUi = function <T> (label: string, selector: string) {
  return cWaitForState<T>(Fun.always)(label, selector);
};

const cTriggerContextMenu = function (label: string, target: string, menu: string) {
  return Chain.fromChains([
    cEditorRoot,
    UiFinder.cFindIn(target),
    Mouse.cContextMenu,

    // Ignores input
    cWaitForPopup(label, menu)
  ]);
};

const cClickPopupButton = function (btnType: 'dialogCloseSelector' | 'dialogSubmitSelector', selector?: string) {
  const popupSelector = selector ? selector : '[role="dialog"]';

  return NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), cWaitForVisible('waiting for: ' + popupSelector, popupSelector), 'popup'),
    NamedChain.direct('popup', Chain.binder((container) => UiFinder.findIn(container, getThemeSelectors()[btnType])), 'button'),
    NamedChain.direct('button', Mouse.cClick, '_'),
    NamedChain.outputInput
  ]);
};

const cCloseDialog = (selector: string) => cClickPopupButton('dialogCloseSelector', selector);

const cSubmitDialog = (selector?: string) => cClickPopupButton('dialogSubmitSelector', selector);

export const UiChains: UiChains = {
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
