asynctest(
  'browser.tinymce.core.ui.PanelTest',
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

    var createPanel = function (settings) {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.update('');

      return Factory.create(Tools.extend({
        type: 'panel'
      }, settings)).renderTo(viewBlock.get()).reflow();
    };

    suite.test("panel width: 100, height: 100", function () {
      var panel = createPanel({
        width: 100,
        height: 100
      });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 100, 100], 4);
    });

    suite.test("panel border: 1, width: 100, height: 100", function () {
      var panel = createPanel({
        width: 100,
        height: 100,
        border: 1
      });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 100, 100], 4);
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
