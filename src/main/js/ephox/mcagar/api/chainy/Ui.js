define(
  'ephox.mcagar.api.chainy.Ui',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.UiFinder',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.view.Visibility',
    'global!document'
  ],

  function (Assertions, Chain, Pipeline, Mouse, UiFinder, Fun, Arr, Merger, Element, Visibility, document) {

    // would be great to have something like thins in Chain API, it's basically
    // like Chain.on, but from inside one can return another chain
    Chain.disrupt = function (callback) {
      return Chain.on(function (input, next, die) {
        Pipeline.async({}, [
          Chain.asStep({}, [callback(input)])
        ], function () {
          next(Chain.wrap(input));
        }, die);
      });
    };

    var dialogRoot = Element.fromDom(document.body);

    // does nothing but retains the context
    var cNoop = Chain.op(Fun.noop);

    var cToolstripRoot = Chain.mapper(function (editor) {
      return Element.fromDom(editor.getContainer());
    });

    var cEditorRoot = Chain.mapper(function (editor) {
      return Element.fromDom(editor.getBody());
    });

    var cDialogRoot = Chain.inject(dialogRoot);

    var cGetToolbarRoot = Chain.fromChains([
      cToolstripRoot,
      UiFinder.cFindIn('.mce-toolbar-grp')
    ]);

    var cGetMenuRoot = Chain.fromChains([
      cToolstripRoot,
      UiFinder.cFindIn('.mce-menubar')
    ]);

    var cFindIn = function (cRoot, selector) {
      return Chain.fromChains([
        cRoot,
        UiFinder.cFindIn(selector)
      ]);
    };

    var cClickOnToolbar = function (label, selector) {
      return Chain.fromParent(cNoop, [
        Chain.fromChains([
          cGetToolbarRoot,
          UiFinder.cFindIn(selector),
          Mouse.cClick
        ])
      ]);
    };

    var cClickOnMenu = function (label, selector) {
      return Chain.fromParent(cNoop, [
        Chain.fromChains([
          cGetMenuRoot,
          UiFinder.cFindIn(selector),
          Mouse.cClick
        ])
      ]);
    };

    var cClickOnUi = function (label, selector) {
      return Chain.fromParent(cNoop, [
        Chain.fromChains([
          cDialogRoot,
          UiFinder.cFindIn(selector),
          Mouse.cClick
        ])
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
        return Chain.fromChains([
          cDialogRoot,
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
        cEditorRoot,
        UiFinder.cFindIn(target),
        Mouse.cContextMenu,

        // Ignores input
        cWaitForPopup(label, menu)
      ]);
    };

    var cDialogByPopup = function (editor) {
      return Chain.on(function (popup, next, die) {
        return Arr.find(editor.windowManager.getWindows(), function (dialog) {
          return popup.dom().id === dialog._id;
        }).fold(die, function (dialog) {
          next(Chain.wrap(dialog));
        });
      });
    };

    var cWaitForDialog = function (editor, selector) {
      selector = selector || '[role="dialog"]';
      return Chain.fromChains([
        cWaitForPopup('waiting for: ' + selector, selector),
        cDialogByPopup(editor)
      ]);
    };

    var cAssertDialogContents = function (data, selector) {
      return Chain.disrupt(function (editor) {
        return Chain.fromChains([
          cWaitForDialog(editor, selector),
          Chain.op(function (dialog) {
            Assertions.assertEq('asserting contents of: ' + selector, data, dialog.toJSON());
          })
        ]);
      });
    };

    var cFillDialog = function (data, selector) {
      return Chain.disrupt(function (editor) {
        return Chain.fromChains([
          cWaitForDialog(editor, selector),
          Chain.op(function (dialog) {
            dialog.fromJSON(Merger.merge(dialog.toJSON(), data));
          })
        ]);
      });
    };

    var cSubmitDialog = function (selector) {
      return Chain.disrupt(function (editor) {
        selector = selector || '[role="dialog"]';
        return Chain.fromChains([
          cWaitForPopup('waiting for: ' + selector, selector),
          UiFinder.cFindIn('div.mce-primary > button'),
          Mouse.cClick
        ]);
      });
    };

    return {
      cClickOnToolbar: cClickOnToolbar,
      cClickOnMenu: cClickOnMenu,
      cClickOnUi: cClickOnUi,

      // Popups need to be visible.
      cWaitForPopup: cWaitForPopup,
      // UI does not need to be visible
      cWaitForUi: cWaitForUi,
      // General state predicate
      cWaitForState: cWaitForState,

      cFillDialog: cFillDialog,
      cSubmitDialog: cSubmitDialog,
      cAssertDialogContents: cAssertDialogContents,

      cTriggerContextMenu: cTriggerContextMenu,

      sWaitForUi: sWaitForUi,
      sWaitForPopup: sWaitForPopup
    };
  }
);