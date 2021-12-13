import { Assertions, Chain, Mouse, Step, UiFinder } from '@ephox/agar';
import { Arr, Fun } from '@ephox/katamari';
import { SugarElement, SugarShadowDom, Visibility } from '@ephox/sugar';

import { Editor } from '../../alien/EditorTypes';
import * as TinyUiActions from '../bdd/TinyUiActions';
import { getThemeSelectors } from '../ThemeSelectors';

export interface TinyUi {
  clickOnToolbar: (elector: string) => void;
  clickOnMenu: (selector: string) => void;
  clickOnUi: (selector: string) => void;
  submitDialog: (selector: string) => void;

  pWaitForUi: (selector: string) => Promise<SugarElement<Element>>;
  pWaitForPopup: (selector: string) => Promise<SugarElement<HTMLElement>>;

  sClickOnToolbar: <T> (label: string, selector: string) => Step<T, T>;
  sClickOnMenu: <T> (label: string, selector: string) => Step<T, T>;
  sClickOnUi: <T> (label: string, selector: string) => Step<T, T>;

  sWaitForUi: <T> (label: string, selector: string) => Step<T, T>;
  sWaitForPopup: <T> (label: string, selector: string) => Step<T, T>;
  sFillDialogWith: <T> (data: Record<string, any>, selector: string) => Step<T, T>;
  sSubmitDialog: <T> (selector: string) => Step<T, T>;

  cWaitForPopup: <T> (label: string, selector: string) => Chain<T, SugarElement<HTMLElement>>;
  cWaitForUi: <T> (label: string, selector: string) => Chain<T, SugarElement<Element>>;
  cWaitForState: <T, U extends Element> (hasState: (element: SugarElement<U>) => boolean) => (label: string, selector: string) => Chain<T, SugarElement<U>>;

  cFillDialogWith: <T extends Element> (data: Record<string, any>) => Chain<SugarElement<T>, SugarElement<T>>;
  cSubmitDialog: <T extends Element> () => Chain<SugarElement<T>, SugarElement<T>>;
  cAssertDialogContents: <T extends Element> (data: Record<string, any>) => Chain<SugarElement<T>, SugarElement<T>>;

  cTriggerContextMenu: (label: string, target: string, menu: string) => Chain<unknown, SugarElement<HTMLElement>>;
}

export const TinyUi = (editor: Editor): TinyUi => {
  const uiRoot = SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(SugarElement.fromDom(editor.getElement())));
  const editorRoot = SugarElement.fromDom(editor.getBody());

  const clickOnToolbar = Fun.curry(TinyUiActions.clickOnToolbar, editor);
  const clickOnMenu = Fun.curry(TinyUiActions.clickOnMenu, editor);
  const clickOnUi = Fun.curry(TinyUiActions.clickOnUi, editor);
  const submitDialog = Fun.curry(TinyUiActions.submitDialog, editor);
  const pWaitForUi = Fun.curry(TinyUiActions.pWaitForUi, editor);
  const pWaitForPopup = Fun.curry(TinyUiActions.pWaitForPopup, editor);

  const cUiRoot = Chain.inject(uiRoot);
  const cEditorRoot = Chain.inject(editorRoot);

  const cFindIn = (cRoot: Chain<SugarElement<Node>, SugarElement<Node>>, selector: string) => {
    return Chain.fromChains([
      cRoot,
      UiFinder.cFindIn(selector)
    ]);
  };

  const sClickOnToolbar = <T>(label: string, selector: string) => Step.label(label, Step.sync<T>(() => {
    TinyUiActions.clickOnToolbar(editor, selector);
  }));

  const sClickOnMenu = <T>(label: string, selector: string) => Step.label(label, Step.sync<T>(() => {
    TinyUiActions.clickOnMenu(editor, selector);
  }));

  const sClickOnUi = <T>(label: string, selector: string) => Step.label(label, Step.sync<T>(() => {
    TinyUiActions.clickOnUi(editor, selector);
  }));

  const sWaitForUi = <T>(label: string, selector: string) => {
    return Chain.asStep<T, any>({}, [
      cWaitForUi(label, selector)
    ]);
  };

  const sWaitForPopup = <T>(label: string, selector: string) => {
    return Chain.asStep<T, any>({}, [
      cWaitForPopup(label, selector)
    ]);
  };

  const cWaitForState = <T, U extends Element>(hasState: (element: SugarElement<U>) => boolean) => {
    return (label: string, selector: string): Chain<T, SugarElement<U>> => {
      return Chain.fromChainsWith(uiRoot, [
        UiFinder.cWaitForState(label, selector, hasState)
      ]);
    };
  };

  const cWaitForPopup = (label: string, selector: string) => {
    return cWaitForState(Visibility.isVisible)(label, selector);
  };

  const cWaitForUi = (label: string, selector: string) => {
    return cWaitForState(Fun.always)(label, selector);
  };

  const cTriggerContextMenu = (label: string, target: string, menu: string): Chain<unknown, SugarElement<HTMLElement>> => {
    return Chain.fromChains([
      cFindIn(cEditorRoot, target),
      Mouse.cContextMenu,

      // Ignores input
      cWaitForPopup(label, menu)
    ]);
  };

  const getDialogByElement = (element: SugarElement<Element>) => {
    return Arr.find(editor.windowManager.getWindows(), (win: any) => {
      return element.dom.id === win._id;
    });
  };

  const cAssertDialogContents = <T extends Element> (data: Record<string, any>) => {
    return Chain.async<SugarElement<T>, SugarElement<T>>((element, next, die) => {
      getDialogByElement(element).fold(() => die('Can not find dialog'), (win) => {
        Assertions.assertEq('asserting dialog contents', data, win.toJSON());
        next(element);
      });
    });
  };

  const cFillDialogWith = <T extends Element> (data: Record<string, any>) => {
    return Chain.async<SugarElement<T>, SugarElement<T>>((element, next, die) => {
      getDialogByElement(element).fold(() => die('Can not find dialog'), (win) => {
        win.fromJSON({ ...win.toJSON(), ...data });
        next(element);
      });
    });
  };

  const sFillDialogWith = <T>(data: Record<string, any>, selector: string) => {
    return Chain.asStep<T, any>({}, [
      cFindIn(cUiRoot, selector),
      cFillDialogWith(data)
    ]);
  };

  const cSubmitDialog = <T extends Element> () => {
    return Chain.fromChains<SugarElement<T>, SugarElement<T>>([
      Chain.binder((container: SugarElement<T>) => UiFinder.findIn(container, getThemeSelectors().dialogSubmitSelector)),
      Mouse.cClick
    ]);
  };

  const sSubmitDialog = <T>(selector: string) => {
    return Chain.asStep<T, any>({}, [
      cFindIn(cUiRoot, selector),
      cSubmitDialog()
    ]);
  };

  return {
    clickOnToolbar,
    clickOnMenu,
    clickOnUi,
    submitDialog,

    pWaitForUi,
    pWaitForPopup,

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
