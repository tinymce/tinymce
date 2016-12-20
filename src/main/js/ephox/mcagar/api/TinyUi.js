define(
  'ephox.mcagar.api.TinyUi',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.UiFinder',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.view.Visibility',
    'global!document'
  ],

  function (Chain, Mouse, UiFinder, Fun, Element, Visibility, document) {
  	return function (editor) {
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

        cTriggerContextMenu: cTriggerContextMenu,

        sWaitForUi: sWaitForUi,
        sWaitForPopup: sWaitForPopup
      };
  	};
  }
);