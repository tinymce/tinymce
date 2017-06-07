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
    'ephox.sugar.api.search.PredicateFilter',
    'ephox.sugar.api.search.Selectors',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'ephox.mcagar.api.TinyUi',
    'ephox.mcagar.api.TinyDom'
  ],
  function (Pipeline, Step, Chain, Mouse, Guard, UiFinder, Visibility, Attr, PredicateFilter, Selectors, Fun, Result, TinyUi, TinyDom) {

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
          Guard.tryUntil("Predicate has failed.", 10, 3000)
        );
      };


      var cWaitForChain = function (chain) {
        return Chain.control(
          chain,
          Guard.tryUntil("Chain has failed.", 10, 3000)
        );
      };


      var cFindChildWithState = function (selector, predicate) {
        return Chain.on(function (scope, next, die) {
          var children = PredicateFilter.descendants(scope, function (element) {
            return Selectors.is(element, selector) && predicate(element);
          });
          children.length ? next(Chain.wrap(children[0])) : die();
        });
      };


      var cExecCommandFromDialog = function (label) {
        var cInteractWithUi;

        switch (label) {
          case 'Rotate counterclockwise':
          case 'Rotate clockwise':
          case 'Flip vertically':
          case 'Flip horizontally':
            // Orientation operations, like Flip or Rotate are grouped in a sub-panel
            // and require an additional step
            cInteractWithUi = cClickToolbarButton(label);
            label = 'Orientation';
            break;

          case 'Brightness':
          default:
            cInteractWithUi = Chain.wait(1);
        }



        return Chain.fromChains([
          cClickToolbarButton('Edit image'),
          Chain.fromParent(ui.cWaitForPopup('wait for Edit Image dialog', 'div[aria-label="Edit image"][role="dialog"]'), [
            ui.cWaitForUi('wait for canvas', '.mce-imagepanel > img'),
            cClickToolbarButton(label),
            Chain.wait(500),
            Chain.fromChains([
              cWaitForChain(cFindChildWithState('.mce-container.mce-form', Visibility.isVisible)),
              Chain.wait(500),
              cInteractWithUi,
              cClickButton('Apply')
            ]),
            ui.cWaitForUi('wait for Save button to become enabled', 'div[role="button"]:contains(Save):not(.mce-disabled)'),
            cClickButton('Save')
          ])
        ]);
      };


      var cClickButton = function (text) {
        return Chain.fromChains([
          //UiFinder.cFindIn('div[role="button"]:contains(' + text + ')'),
          ui.cWaitForUi('wait for ' + text + ' button', 'div[role="button"]:contains(' + text + '):not(.mce-disabled)'),
          Mouse.cClick
        ]);
      };


      var cClickToolbarButton = function (label) {
        return Chain.fromChains([
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


      var sExec = function (execFromToolbar, label) {
        return Step.async(function (next, die) {
          var imgEl = TinyDom.fromDom(editor.selection.getNode());
          var origUrl = Attr.get(imgEl, 'src');

          Pipeline.async({}, [
            Chain.asStep(imgEl, [
              Mouse.cClick,
              ui.cWaitForPopup('wait for Imagetools toolbar', 'div[aria-label="Inline toolbar"][role="dialog"]'),
              execFromToolbar ? cClickToolbarButton(label) : cExecCommandFromDialog(label)
            ]),
            sWaitForUrlChange(imgEl, origUrl)
          ], function () {
            next();
          }, die);
        });
      };



      return {
        sExecToolbar: Fun.curry(sExec, true),
        sExecDialog: Fun.curry(sExec, false)
      };
    };
  }
);
