import { Assertions, Chain, Mouse, UiFinder } from '@ephox/agar';
import { document } from '@ephox/dom-globals';
import { Arr, Fun, Merger } from '@ephox/katamari';
import { Element, Visibility } from '@ephox/sugar';
import { getThemeSelectors } from './ThemeSelectors';

export default function (editor) {
  var dialogRoot = Element.fromDom(document.body);
  var toolstripRoot = Element.fromDom(editor.getContainer());
  var editorRoot = Element.fromDom(editor.getBody());

  var cDialogRoot = Chain.inject(dialogRoot);

  var cGetToolbarRoot = Chain.fromChainsWith(toolstripRoot, [
    Chain.binder((container: Element) => {
      return UiFinder.findIn(container, getThemeSelectors().toolBarSelector);
    })
  ]);

  var cGetMenuRoot = Chain.fromChainsWith(toolstripRoot, [
    Chain.binder((container: Element) => {
      return UiFinder.findIn(container, getThemeSelectors().menuBarSelector);
    })
  ]);

  var cEditorRoot = Chain.inject(editorRoot);

  var cFindIn = function (cRoot, selector: string) {
    return Chain.fromChains([
      cRoot,
      UiFinder.cFindIn(selector)
    ]);
  };

  var sClickOnToolbar = function (label: string, selector: string) {
    return Chain.asStep({}, [
      cFindIn(cGetToolbarRoot, selector),
      Mouse.cClick
    ]);
  };

  var sClickOnMenu = function (label: string, selector: string) {
    return Chain.asStep({}, [
      cFindIn(cGetMenuRoot, selector),
      Mouse.cClick
    ]);
  };

  var sClickOnUi = function (label: string, selector: string) {
    return Chain.asStep({}, [
      cFindIn(cDialogRoot, selector),
      Mouse.cClick
    ]);
  };

  var sWaitForUi = function (label: string, selector: string) {
    return Chain.asStep({}, [
      cWaitForUi(label, selector)
    ]);
  };

  var sWaitForPopup = function (label: string, selector: string) {
    return Chain.asStep({}, [
      cWaitForPopup(label, selector)
    ]);
  };

  var cWaitForState = function (hasState) {
    return function (label: string, selector: string) {
      return Chain.fromChainsWith(dialogRoot, [
        UiFinder.cWaitForState(label, selector, hasState)
      ]);
    };
  };

  var cWaitForPopup = function (label: string, selector: string) {
    return cWaitForState(Visibility.isVisible)(label, selector);
  };

  var cWaitForUi = function (label: string, selector: string) {
    return cWaitForState(Fun.constant(true))(label, selector);
  };

  var cTriggerContextMenu = function (label: string, target, menu) {
    return Chain.fromChains([
      cFindIn(cEditorRoot, target),
      Mouse.cContextMenu,

      // Ignores input
      cWaitForPopup(label, menu)
    ]);
  };

  var getDialogByElement = function (element) {
    return Arr.find(editor.windowManager.getWindows(), function (win) {
      return element.dom().id === win._id;
    });
  };

  var cAssertDialogContents = function (data) {
    return Chain.async(function (element, next, die) {
      getDialogByElement(element).fold(() => die('Can not find dialog'), function (win) {
        Assertions.assertEq('asserting dialog contents', data, win.toJSON());
        next(element);
      });
    });
  };

  var cFillDialogWith = function (data) {
    return Chain.async(function (element, next, die) {
      getDialogByElement(element).fold(() => die('Can not find dialog'), function (win) {
        win.fromJSON(Merger.merge(win.toJSON(), data));
        next(element);
      });
    });
  };

  var sFillDialogWith = function (data, selector: string) {
    return Chain.asStep({}, [
      cFindIn(cDialogRoot, selector),
      cFillDialogWith(data)
    ]);
  };

  var cSubmitDialog = function () {
    return Chain.fromChains([
      Chain.binder((container: Element) => {
        return UiFinder.findIn(container, getThemeSelectors().dialogSubmitSelector);
      }),
      Mouse.cClick
    ]);
  };

  var sSubmitDialog = function (selector: string) {
    return Chain.asStep({}, [
      cFindIn(cDialogRoot, selector),
      cSubmitDialog()
    ]);
  };

  return {
    sClickOnToolbar: sClickOnToolbar,
    sClickOnMenu: sClickOnMenu,
    sClickOnUi: sClickOnUi,

    // Popups need to be visible.
    cWaitForPopup: cWaitForPopup,
    // UI does not need to be visible
    cWaitForUi: cWaitForUi,
    // General state predicate
    cWaitForState: cWaitForState,

    cFillDialogWith: cFillDialogWith,
    sFillDialogWith: sFillDialogWith,
    cSubmitDialog: cSubmitDialog,
    sSubmitDialog: sSubmitDialog,
    cAssertDialogContents: cAssertDialogContents,

    cTriggerContextMenu: cTriggerContextMenu,

    sWaitForUi: sWaitForUi,
    sWaitForPopup: sWaitForPopup
  };
};
