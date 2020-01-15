import { Assertions, Chain, Mouse, Step, UiFinder } from '@ephox/agar';
import { document } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { Element, Visibility } from '@ephox/sugar';
import { Editor } from '../alien/EditorTypes';
import { getThemeSelectors } from './ThemeSelectors';

export interface TinyUi {
  sClickOnToolbar: <T> (label: string, selector: string) => Step<T, T>;
  sClickOnMenu: <T> (label: string, selector: string) => Step<T, T>;
  sClickOnUi: <T> (label: string, selector: string) => Step<T, T>;

  sWaitForUi: <T> (label: string, selector: string) => Step<T, T>;
  sWaitForPopup: <T> (label: string, selector: string) => Step<T, T>;
  sFillDialogWith: <T> (data: Record<string, any>, selector: string) => Step<T, T>;
  sSubmitDialog: <T> (selector: string) => Step<T, T>;

  cWaitForPopup: <T> (label: string, selector: string) => Chain<T, Element>;
  cWaitForUi: <T> (label: string, selector: string) => Chain<T, Element>;
  cWaitForState: <T> (hasState: (element: Element) => boolean) => (label: string, selector: string) => Chain<T, Element>;

  cFillDialogWith: (data: Record<string, any>) => Chain<Element, Element>;
  cSubmitDialog: () => Chain<Element, Element>;
  cAssertDialogContents: (data: Record<string, any>) => Chain<Element, Element>;

  cTriggerContextMenu: (label: string, target: string, menu: string) => Chain<Element, Element>;
}

export const TinyUi = function (editor: Editor): TinyUi {
  const dialogRoot = Element.fromDom(document.body);
  const toolstripRoot = Element.fromDom(editor.getContainer());
  const editorRoot = Element.fromDom(editor.getBody());

  const cDialogRoot = Chain.inject(dialogRoot);

  const cGetToolbarRoot = Chain.fromChainsWith<Element, Element, Element>(toolstripRoot, [
    Chain.binder((container: Element) => {
      return UiFinder.findIn(container, getThemeSelectors().toolBarSelector(editor));
    })
  ]);

  const cGetMenuRoot = Chain.fromChainsWith<Element, Element, Element>(toolstripRoot, [
    Chain.binder((container: Element) => {
      return UiFinder.findIn(container, getThemeSelectors().menuBarSelector);
    })
  ]);

  const cEditorRoot = Chain.inject(editorRoot);

  const cFindIn = function (cRoot: Chain<Element, Element>, selector: string) {
    return Chain.fromChains([
      cRoot,
      UiFinder.cFindIn(selector)
    ]);
  };

  const sClickOnToolbar = function <T> (label: string, selector: string) {
    return Chain.asStep<T, any>({}, [
      cFindIn(cGetToolbarRoot, selector),
      Mouse.cClick
    ]);
  };

  const sClickOnMenu = function <T>(label: string, selector: string) {
    return Chain.asStep<T, any>({}, [
      cFindIn(cGetMenuRoot, selector),
      Mouse.cClick
    ]);
  };

  const sClickOnUi = function <T> (label: string, selector: string) {
    return Chain.asStep<T, any>({}, [
      cFindIn(cDialogRoot, selector),
      Mouse.cClick
    ]);
  };

  const sWaitForUi = function <T> (label: string, selector: string) {
    return Chain.asStep<T, any>({}, [
      cWaitForUi(label, selector)
    ]);
  };

  const sWaitForPopup = function <T> (label: string, selector: string) {
    return Chain.asStep<T, any>({}, [
      cWaitForPopup(label, selector)
    ]);
  };

  const cWaitForState = function <T> (hasState: (element: Element) => boolean) {
    return function (label: string, selector: string) {
      return Chain.fromChainsWith<Element, T, Element>(dialogRoot, [
        UiFinder.cWaitForState(label, selector, hasState)
      ]);
    };
  };

  const cWaitForPopup = function (label: string, selector: string) {
    return cWaitForState(Visibility.isVisible)(label, selector);
  };

  const cWaitForUi = function (label: string, selector: string) {
    return cWaitForState(Fun.constant(true))(label, selector);
  };

  const cTriggerContextMenu = function (label: string, target: string, menu: string) {
    return Chain.fromChains<Element, Element>([
      cFindIn(cEditorRoot, target),
      Mouse.cContextMenu,

      // Ignores input
      cWaitForPopup(label, menu)
    ]);
  };

  const getDialogByElement = function (element: Element) {
    return Arr.find(editor.windowManager.getWindows(), function (win) {
      return element.dom().id === win._id;
    });
  };

  const cAssertDialogContents = function (data: Record<string, any>) {
    return Chain.async<Element, Element>(function (element, next, die) {
      getDialogByElement(element).fold(() => die('Can not find dialog'), function (win) {
        Assertions.assertEq('asserting dialog contents', data, win.toJSON());
        next(element);
      });
    });
  };

  const cFillDialogWith = function (data: Record<string, any>) {
    return Chain.async<Element, Element>(function (element, next, die) {
      getDialogByElement(element).fold(() => die('Can not find dialog'), function (win) {
        win.fromJSON({ ...win.toJSON(), ...data });
        next(element);
      });
    });
  };

  const sFillDialogWith = function <T> (data: Record<string, any>, selector: string) {
    return Chain.asStep<T, any>({}, [
      cFindIn(cDialogRoot, selector),
      cFillDialogWith(data)
    ]);
  };

  const cSubmitDialog = function () {
    return Chain.fromChains<Element, Element>([
      Chain.binder((container: Element) => {
        return UiFinder.findIn(container, getThemeSelectors().dialogSubmitSelector);
      }),
      Mouse.cClick
    ]);
  };

  const sSubmitDialog = function <T> (selector: string) {
    return Chain.asStep<T, any>({}, [
      cFindIn(cDialogRoot, selector),
      cSubmitDialog()
    ]);
  };

  return {
    sClickOnToolbar,
    sClickOnMenu,
    sClickOnUi,

    // Popups need to be visible.
    cWaitForPopup,
    // UI does not need to be visible
    cWaitForUi,
    // General state predicate
    cWaitForState,

    cFillDialogWith,
    sFillDialogWith,
    cSubmitDialog,
    sSubmitDialog,
    cAssertDialogContents,

    cTriggerContextMenu,

    sWaitForUi,
    sWaitForPopup
  };
};
