import { Assertions, Chain, Mouse, UiFinder } from '@ephox/agar';
import { document } from '@ephox/dom-globals';
import { Arr, Fun, Merger } from '@ephox/katamari';
import { Element, Visibility } from '@ephox/sugar';
import { getThemeSelectors } from './ThemeSelectors';

export default function (editor) {
  const dialogRoot = Element.fromDom(document.body);
  const toolstripRoot = Element.fromDom(editor.getContainer());
  const editorRoot = Element.fromDom(editor.getBody());

  const cDialogRoot = Chain.inject(dialogRoot);

  const cGetToolbarRoot = Chain.fromChainsWith(toolstripRoot, [
    Chain.binder((container: Element) => {
      return UiFinder.findIn(container, getThemeSelectors().toolBarSelector);
    })
  ]);

  const cGetMenuRoot = Chain.fromChainsWith(toolstripRoot, [
    Chain.binder((container: Element) => {
      return UiFinder.findIn(container, getThemeSelectors().menuBarSelector);
    })
  ]);

  const cEditorRoot = Chain.inject(editorRoot);

  const cFindIn = function (cRoot, selector: string) {
    return Chain.fromChains([
      cRoot,
      UiFinder.cFindIn(selector)
    ]);
  };

  const sClickOnToolbar = function (label: string, selector: string) {
    return Chain.asStep({}, [
      cFindIn(cGetToolbarRoot, selector),
      Mouse.cClick
    ]);
  };

  const sClickOnMenu = function (label: string, selector: string) {
    return Chain.asStep({}, [
      cFindIn(cGetMenuRoot, selector),
      Mouse.cClick
    ]);
  };

  const sClickOnUi = function (label: string, selector: string) {
    return Chain.asStep({}, [
      cFindIn(cDialogRoot, selector),
      Mouse.cClick
    ]);
  };

  const sWaitForUi = function (label: string, selector: string) {
    return Chain.asStep({}, [
      cWaitForUi(label, selector)
    ]);
  };

  const sWaitForPopup = function (label: string, selector: string) {
    return Chain.asStep({}, [
      cWaitForPopup(label, selector)
    ]);
  };

  const cWaitForState = function (hasState) {
    return function (label: string, selector: string) {
      return Chain.fromChainsWith(dialogRoot, [
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

  const cTriggerContextMenu = function (label: string, target, menu) {
    return Chain.fromChains([
      cFindIn(cEditorRoot, target),
      Mouse.cContextMenu,

      // Ignores input
      cWaitForPopup(label, menu)
    ]);
  };

  const getDialogByElement = function (element) {
    return Arr.find(editor.windowManager.getWindows(), function (win) {
      return element.dom().id === win._id;
    });
  };

  const cAssertDialogContents = function (data) {
    return Chain.async(function (element, next, die) {
      getDialogByElement(element).fold(() => die('Can not find dialog'), function (win) {
        Assertions.assertEq('asserting dialog contents', data, win.toJSON());
        next(element);
      });
    });
  };

  const cFillDialogWith = function (data) {
    return Chain.async(function (element, next, die) {
      getDialogByElement(element).fold(() => die('Can not find dialog'), function (win) {
        win.fromJSON(Merger.merge(win.toJSON(), data));
        next(element);
      });
    });
  };

  const sFillDialogWith = function (data, selector: string) {
    return Chain.asStep({}, [
      cFindIn(cDialogRoot, selector),
      cFillDialogWith(data)
    ]);
  };

  const cSubmitDialog = function () {
    return Chain.fromChains([
      Chain.binder((container: Element) => {
        return UiFinder.findIn(container, getThemeSelectors().dialogSubmitSelector);
      }),
      Mouse.cClick
    ]);
  };

  const sSubmitDialog = function (selector: string) {
    return Chain.asStep({}, [
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
}
