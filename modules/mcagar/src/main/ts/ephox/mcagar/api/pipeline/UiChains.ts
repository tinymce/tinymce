import { Chain, Guard, Mouse, NamedChain, UiFinder } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { SugarBody, SugarElement, Visibility } from '@ephox/sugar';

import { Editor } from '../../alien/EditorTypes';
import { getThemeSelectors } from '../ThemeSelectors';

export interface UiChains {
  cClickOnToolbar: <T extends Editor> (label: string, selector: string) => Chain<T, T>;
  cClickOnMenu: <T extends Editor> (label: string, selector: string) => Chain<T, T>;
  cClickOnUi: <T> (label: string, selector: string) => Chain<T, T>;

  cWaitForPopup: <T> (label: string, selector: string) => Chain<T, T>;
  cWaitForUi: <T> (label: string, selector: string) => Chain<T, T>;
  cWaitForState: <T, U extends Element> (hasState: (element: SugarElement<U>) => boolean) => (label: string, selector: string) => Chain<T, T>;

  cCloseDialog: <T> (selector: string) => Chain<T, T>;
  cSubmitDialog: <T> (selector?: string) => Chain<T, T>;

  cTriggerContextMenu: <T extends Editor> (label: string, target: string, menu: string) => Chain<T, T>;
}

const cToolstripRoot = Chain.mapper((editor: Editor) => {
  return SugarElement.fromDom(editor.getContainer());
});

const cEditorRoot = Chain.mapper((editor: Editor) => {
  return SugarElement.fromDom(editor.getBody());
});

const cDialogRoot = Chain.injectThunked(SugarBody.body);

const cGetToolbarRoot: Chain<Editor, SugarElement<HTMLElement>> = NamedChain.asChain([
  NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
  NamedChain.direct('editor', cToolstripRoot, 'container'),
  NamedChain.merge([ 'editor', 'container' ], 'data'),
  NamedChain.direct('data', Chain.binder((data: { editor: Editor; container: SugarElement<HTMLElement> }) => UiFinder.findIn(data.container, getThemeSelectors().toolBarSelector(data.editor))), 'toolbar'),
  NamedChain.output('toolbar')
]);

const cGetMenuRoot = Chain.fromChains<Editor, SugarElement<HTMLElement>>([
  cToolstripRoot,
  Chain.binder((container: SugarElement<HTMLElement>) => UiFinder.findIn(container, getThemeSelectors().menuBarSelector))
]);

const cClickOnWithin = <T>(label: string, selector: string, cContext: Chain<T, SugarElement<Node>>): Chain<T, T> => {
  return Chain.control(
    NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), cContext, 'context'),
      NamedChain.direct('context', UiFinder.cFindIn(selector), 'ui'),
      NamedChain.direct('ui', Mouse.cClick, '_'),
      NamedChain.outputInput
    ]),
    Guard.addLogging(label)
  );
};

const cClickOnUi = <T>(label: string, selector: string): Chain<T, T> => {
  return cClickOnWithin<T>(label, selector, cDialogRoot);
};

const cClickOnToolbar = <T extends Editor>(label: string, selector: string): Chain<T, T> => {
  return cClickOnWithin<T>(label, selector, cGetToolbarRoot);
};

const cClickOnMenu = <T extends Editor>(label: string, selector: string): Chain<T, T> => {
  return cClickOnWithin<T>(label, selector, cGetMenuRoot);
};

const cWaitForState = <T, U extends Element>(hasState: (element: SugarElement<U>) => boolean) => {
  return (label: string, selector: string): Chain<T, T> => {
    return NamedChain.asChain([
      NamedChain.write('element', Chain.fromChains([
        cDialogRoot,
        UiFinder.cWaitForState(label, selector, hasState)
      ])),
      NamedChain.outputInput
    ]);
  };
};

const cWaitForVisible = <T>(label: string, selector: string): Chain<T, T> => {
  return Chain.fromChains([
    cDialogRoot,
    UiFinder.cWaitForState(label, selector, Visibility.isVisible)
  ]);
};

const cWaitForPopup = <T>(label: string, selector: string): Chain<T, T> => {
  return cWaitForState<T, HTMLElement>(Visibility.isVisible)(label, selector);
};

const cWaitForUi = <T>(label: string, selector: string): Chain<T, T> => {
  return cWaitForState<T, Element>(Fun.always)(label, selector);
};

const cTriggerContextMenu = <T>(label: string, target: string, menu: string): Chain<T, T> => {
  return Chain.fromChains([
    cEditorRoot,
    UiFinder.cFindIn(target),
    Mouse.cContextMenu,

    // Ignores input
    cWaitForPopup(label, menu)
  ]);
};

const cClickPopupButton = <T>(btnType: 'dialogCloseSelector' | 'dialogSubmitSelector', selector?: string): Chain<T, T> => {
  const popupSelector = selector ? selector : '[role="dialog"]';

  return NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), cWaitForVisible('waiting for: ' + popupSelector, popupSelector), 'popup'),
    NamedChain.direct('popup', Chain.binder((container) => UiFinder.findIn(container, getThemeSelectors()[btnType])), 'button'),
    NamedChain.direct('button', Mouse.cClick, '_'),
    NamedChain.outputInput
  ]);
};

const cCloseDialog = <T>(selector: string): Chain<T, T> =>
  cClickPopupButton('dialogCloseSelector', selector);

const cSubmitDialog = <T>(selector?: string): Chain<T, T> =>
  cClickPopupButton('dialogSubmitSelector', selector);

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
