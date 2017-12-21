import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Mouse } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { Arr } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Visibility } from '@ephox/sugar';



export default <any> function (editor) {
  var dialogRoot = Element.fromDom(document.body);
  var toolstripRoot = Element.fromDom(editor.getContainer());
  var editorRoot = Element.fromDom(editor.getBody());

  var cDialogRoot = Chain.inject(dialogRoot);

  var cGetToolbarRoot = Chain.fromChainsWith(toolstripRoot, [
    UiFinder.cFindIn('.mce-toolbar-grp')
  ]);

  var cGetMenuRoot = Chain.fromChainsWith(toolstripRoot, [
    UiFinder.cFindIn('.mce-menubar')
  ]);

  var cEditorRoot = Chain.inject(editorRoot);

  var cFindIn = function (cRoot, selector) {
    return Chain.fromChains([
      cRoot,
      UiFinder.cFindIn(selector)
    ]);
  };

  var sClickOnToolbar = function (label, selector) {
    return Chain.asStep({}, [
      cFindIn(cGetToolbarRoot, selector),
      Mouse.cClick
    ]);
  };

  var sClickOnMenu = function (label, selector) {
    return Chain.asStep({}, [
      cFindIn(cGetMenuRoot, selector),
      Mouse.cClick
    ]);
  };

  var sClickOnUi = function (label, selector) {
    return Chain.asStep({}, [
      cFindIn(cDialogRoot, selector),
      Mouse.cClick
    ]);
  };

  var sWaitForUi = function (label, selector) {
    return Chain.asStep({}, [
      cWaitForUi(label, selector)
    ]);
  };

  var sWaitForPopup = function (label, selector) {
    return Chain.asStep({}, [
      cWaitForPopup(label, selector)
    ]);
  };

  var cWaitForState = function (hasState) {
    return function (label, selector) {
      return Chain.fromChainsWith(dialogRoot, [
        UiFinder.cWaitForState(label, selector, hasState)
      ]);
    };
  };

  var cWaitForPopup = function (label, selector) {
    return cWaitForState(Visibility.isVisible)(label, selector);
  };

  var cWaitForUi = function (label, selector) {
    return cWaitForState(Fun.constant(true))(label, selector);
  };

  var cTriggerContextMenu = function (label, target, menu) {
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
    return Chain.on(function (element, next, die) {
      getDialogByElement(element).fold(die, function (win) {
        Assertions.assertEq('asserting dialog contents', data, win.toJSON());
        next(Chain.wrap(element));
      });
    });
  };

  var cFillDialogWith = function (data) {
    return Chain.on(function (element, next, die) {
      getDialogByElement(element).fold(die, function (win) {
        win.fromJSON(Merger.merge(win.toJSON(), data));
        next(Chain.wrap(element));
      });
    });
  };

  var sFillDialogWith = function (data, selector) {
    return Chain.asStep({}, [
      cFindIn(cDialogRoot, selector),
      cFillDialogWith(data)
    ]);
  };

  var cSubmitDialog = function () {
    return Chain.fromChains([
      UiFinder.cFindIn('div.mce-primary > button'),
      Mouse.cClick
    ]);
  };

  var sSubmitDialog = function (selector) {
    return Chain.asStep({}, [
      cFindIn(cDialogRoot, selector),
      cSubmitDialog
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