asynctest(
  'browser.tinymce.ui.AbsoluteLayoutTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.EventUtils',
    'tinymce.ui.test.UiUtils',
    'tinymce.ui.test.ViewBlock',
    'tinymce.ui.Api',
    'tinymce.core.ui.Factory',
    'tinymce.core.util.Tools'
  ],
  function (Pipeline, LegacyUnit, DOMUtils, EventUtils, UiUtils, ViewBlock, Api, Factory, Tools) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var viewBlock = new ViewBlock();

    // Registers ui widgets to factory
    Api.registerToFactory();

    var createPanel = function (settings) {
      return Factory.create(Tools.extend({
        type: 'panel',
        layout: 'absolute',
        width: 200,
        height: 200
      }, settings)).renderTo(viewBlock.get()).reflow();
    };

    suite.test("spacer x:10, y:20, minWidth: 100, minHeight: 100", function () {
      var panel = createPanel({
        items: [
          { type: 'spacer', x: 10, y: 20, w: 100, h: 120, classes: 'red' }
        ]
      });

      LegacyUnit.deepEqual(UiUtils.rect(viewBlock, panel), [0, 0, 200, 200]);
      LegacyUnit.deepEqual(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [10, 20, 100, 120]);
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