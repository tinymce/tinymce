define(
  'tinymce.plugins.imagetools.test.ImageOps',
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Guard',
    'ephox.agar.api.UiFinder',
    'ephox.sugar.api.view.Visibility',
    'ephox.sugar.api.properties.Attr',
    'ephox.katamari.api.Result',
    'ephox.mcagar.api.TinyUi',
    'ephox.mcagar.api.TinyDom'
  ],
  function (Pipeline, Step, Chain, Mouse, Guard, UiFinder, Visibility, Attr, Result, TinyUi, TinyDom) {

    // IMPORTANT: we match buttons by their aria-label

    return function (editor) {
      var ui = TinyUi(editor);

      var cHasState = function (predicate) {
        return Chain.binder(function (element) {
          return predicate(element) ? Result.value(element) : Result.error("Predicate didn't match.");
        });
      };


      var cWaitForState = function (predicate) {
        return Chain.control(
          cHasState(predicate),
          Guard.tryUntil("Predicate didn't match.", 10, 3000)
        );
      };


      var cFindWithState = function (selector, predicate) {
        return Chain.fromChains([
          UiFinder.cFindIn(selector),
          cHasState(predicate)
        ]);
      };


      var cFindParent = function (selector) {
        return Chain.on(function (element, next, die) {
          var parent = editor.dom.getParent(element.dom(), selector);
          if (!parent) {
            die();
          } else {
            next(Chain.wrap(TinyDom.fromDom(parent)));
          }
        });
      };


      var doesntRequireDialog = function (label) {
        // native indexOf is ok to use on array, since IE9
        return [
          'Rotate counterclockwise',
          'Rotate clockwise',
          'Flip vertically',
          'Flip horizontally',
          'Edit image'
        ].indexOf(label) !== -1;
      };


      var sExecComplexCommand = function (label) {
        return Chain.asStep({}, [
          ui.cWaitForPopup('wait for Imagetools toolbar', 'div[aria-label="Inline toolbar"][role="dialog"]'),
          UiFinder.cFindIn('div[aria-label="Edit image"][role="button"]'),
          Mouse.cClick,
          ui.cWaitForPopup('wait for Edit Image dialog', 'div[aria-label="Edit image"][role="dialog"]'),
          UiFinder.cFindIn('div[aria-label="' + label + '"][role="button"]'),
          Mouse.cClick,
          cFindParent('div[aria-label="Edit image"][role="dialog"]'),
          cFindWithState('.mce-container.mce-form', Visibility.isVisible),
          UiFinder.cFindIn('div.mce-primary > button'), // Apply button
          Mouse.cClick
        ]);
      };


      var sExecCommand = function (label) {
        return Chain.asStep({}, [
          ui.cWaitForPopup('wait for Imagetools toolbar', 'div[aria-label="Inline toolbar"][role="dialog"]'),
          UiFinder.cFindIn('div[aria-label="' + label + '"][role="button"]'),
          Mouse.cClick
        ]);
      };


      var sWaitForUrlChange = function (imgEl, origUrl) {
        return Chain.asStep(imgEl, [
          cWaitForState(function (el) {
            return Attr.get(el, 'src') !== origUrl;
          })
        ]);
      };


      var sExec = function (label) {
        return Step.async(function (next, die) {
          var imgEl = TinyDom.fromDom(editor.selection.getNode());
          var origUrl = Attr.get(imgEl, 'src');

          Pipeline.async({}, [
            Chain.asStep(imgEl, [
              Mouse.cClick
            ]),
            doesntRequireDialog(label) ? sExecCommand(label) : sExecComplexCommand(label),
            sWaitForUrlChange(imgEl, origUrl)
          ], next, die);
        });
      };


      return {
        sExec: sExec
      };
    };
  }
);
