import { Assertions, Chain, Mouse, Step, UiFinder } from '@ephox/agar';
import { Arr, Fun } from '@ephox/katamari';
import { SugarElement, SugarShadowDom, Visibility } from '@ephox/sugar';
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

  cWaitForPopup: <T> (label: string, selector: string) => Chain<T, SugarElement>;
  cWaitForUi: <T> (label: string, selector: string) => Chain<T, SugarElement>;
  cWaitForState: <T> (hasState: (element: SugarElement) => boolean) => (label: string, selector: string) => Chain<T, SugarElement>;

  cFillDialogWith: (data: Record<string, any>) => Chain<SugarElement, SugarElement>;
  cSubmitDialog: () => Chain<SugarElement, SugarElement>;
  cAssertDialogContents: (data: Record<string, any>) => Chain<SugarElement, SugarElement>;

  cTriggerContextMenu: (label: string, target: string, menu: string) => Chain<SugarElement, SugarElement>;
}

export const TinyUi = function (editor: Editor): TinyUi {
  const dialogRoot = SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(SugarElement.fromDom(editor.getElement())));
  const toolstripRoot = SugarElement.fromDom(editor.getContainer());
  const editorRoot = SugarElement.fromDom(editor.getBody());

  const cDialogRoot = Chain.inject(dialogRoot);

  const cGetToolbarRoot = Chain.fromChainsWith<SugarElement, SugarElement, SugarElement>(toolstripRoot, [
    Chain.binder((container: SugarElement) => UiFinder.findIn(container, getThemeSelectors().toolBarSelector(editor)))
  ]);

  const cGetMenuRoot = Chain.fromChainsWith<SugarElement, SugarElement, SugarElement>(toolstripRoot, [
    Chain.binder((container: SugarElement) => UiFinder.findIn(container, getThemeSelectors().menuBarSelector))
  ]);

  const cEditorRoot = Chain.inject(editorRoot);

  const cFindIn = function (cRoot: Chain<SugarElement, SugarElement>, selector: string) {
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

  const sClickOnMenu = function <T> (label: string, selector: string) {
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

  const cWaitForState = function <T> (hasState: (element: SugarElement) => boolean) {
    return function (label: string, selector: string) {
      return Chain.fromChainsWith<SugarElement, T, SugarElement>(dialogRoot, [
        UiFinder.cWaitForState(label, selector, hasState)
      ]);
    };
  };

  const cWaitForPopup = function (label: string, selector: string) {
    return cWaitForState(Visibility.isVisible)(label, selector);
  };

  const cWaitForUi = function (label: string, selector: string) {
    return cWaitForState(Fun.always)(label, selector);
  };

  const cTriggerContextMenu = function (label: string, target: string, menu: string) {
    return Chain.fromChains<SugarElement, SugarElement>([
      cFindIn(cEditorRoot, target),
      Mouse.cContextMenu,

      // Ignores input
      cWaitForPopup(label, menu)
    ]);
  };

  const getDialogByElement = function (element: SugarElement) {
    return Arr.find(editor.windowManager.getWindows(), function (win) {
      return element.dom.id === win._id;
    });
  };

  const cAssertDialogContents = function (data: Record<string, any>) {
    return Chain.async<SugarElement, SugarElement>(function (element, next, die) {
      getDialogByElement(element).fold(() => die('Can not find dialog'), function (win) {
        Assertions.assertEq('asserting dialog contents', data, win.toJSON());
        next(element);
      });
    });
  };

  const cFillDialogWith = function (data: Record<string, any>) {
    return Chain.async<SugarElement, SugarElement>(function (element, next, die) {
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
    return Chain.fromChains<SugarElement, SugarElement>([
      Chain.binder((container: SugarElement) => UiFinder.findIn(container, getThemeSelectors().dialogSubmitSelector)),
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
