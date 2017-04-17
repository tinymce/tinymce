asynctest(
  'browser.tinymce.core.ui.FitLayoutTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.EventUtils',
    'tinymce.core.test.UiUtils',
    'tinymce.core.test.ViewBlock',
    'tinymce.core.ui.Api',
    'tinymce.core.ui.Factory',
    'tinymce.core.util.Tools'
  ],
  function (Pipeline, LegacyUnit, DOMUtils, EventUtils, UiUtils, ViewBlock, Api, Factory, Tools) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var viewBlock = new ViewBlock();

    // Registers ui widgets to factory
    Api.appendTo({});

    var createFitPanel = function (settings) {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.update('');

      return Factory.create(Tools.extend({
        type: 'panel',
        layout: 'fit',
        width: 200,
        height: 200,
        border: 1
      }, settings)).renderTo(viewBlock.get()).reflow();
    };

    suite.test("fit with spacer inside", function () {
      var panel = createFitPanel({
        items: [
          { type: 'spacer', classes: 'red' }
        ]
      });

      LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 200, 200]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [1, 1, 198, 198]);
    });

    suite.test("fit with padding and spacer inside", function () {
      var panel = createFitPanel({
        padding: 3,
        items: [
          { type: 'spacer', classes: 'red' }
        ]
      });

      LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 200, 200]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [4, 4, 192, 192]);
    });

    suite.test("fit with panel inside", function () {
      var panel = createFitPanel({
        items: [
          { type: 'panel', border: 1 }
        ]
      });

      LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 200, 200]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('panel')[0]), [1, 1, 198, 198]);
    });

    UiUtils.loadSkinAndOverride(viewBlock, function () {
      Pipeline.async({}, suite.toSteps({}), function () {
        EventUtils.Event.clean(viewBlock.get());
        viewBlock.detach();
        success();
      }, failure);
    });
  }
);
