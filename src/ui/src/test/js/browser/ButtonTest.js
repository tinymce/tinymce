asynctest(
  'browser.tinymce.ui.ButtonTest',
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

    var createButton = function (settings) {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.update('');

      return Factory.create(Tools.extend({
        type: 'button'
      }, settings)).renderTo(viewBlock.get());
    };

    suite.test("button text, size default", function () {
      var button = createButton({ text: 'X' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 27, 30], 4);
    });

    suite.test("button text, size large", function () {
      var button = createButton({ text: 'X', size: 'large' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 40, 38], 5);
    });

    suite.test("button text, size small", function () {
      var button = createButton({ text: 'X', size: 'small' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 19, 23], 4);
    });

    suite.test("button text, width 100, height 100", function () {
      var button = createButton({ text: 'X', width: 100, height: 100 });

      LegacyUnit.equal(UiUtils.rect(viewBlock, button), [0, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, button.getEl().firstChild), [1, 1, 98, 98]);
    });

    suite.test("button icon, size default", function () {
      var button = createButton({ icon: 'test' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 34, 30], 4);
    });

    suite.test("button icon, size small", function () {
      var button = createButton({ icon: 'test', size: 'small' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 28, 24], 4);
    });

    suite.test("button icon, size large", function () {
      var button = createButton({ icon: 'test', size: 'large' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 44, 40], 4);
    });

    suite.test("button icon, width 100, height 100", function () {
      var button = createButton({ icon: 'test', width: 100, height: 100 });

      LegacyUnit.equal(UiUtils.rect(viewBlock, button), [0, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, button.getEl().firstChild), [1, 1, 98, 98]);
    });

    suite.test("button text & icon, size default", function () {
      var button = createButton({ text: 'X', icon: 'test' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 47, 30], 4);
    });

    suite.test("button text & icon, size large", function () {
      var button = createButton({ text: 'X', icon: 'test', size: 'large' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 59, 40], 4);
    });

    suite.test("button text & icon, size small", function () {
      var button = createButton({ text: 'X', icon: 'test', size: 'small' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 43, 24], 5);
    });

    suite.test("button text & icon, width 100, height 100", function () {
      var button = createButton({ text: 'X', icon: 'test', width: 100, height: 100 });

      LegacyUnit.equal(UiUtils.rect(viewBlock, button), [0, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, button.getEl().firstChild), [1, 1, 98, 98]);
    });

    suite.test("button click event", function () {
      var button, clicks = {};

      button = createButton({
        text: 'X',
        onclick: function () {
          clicks.a = 'a';
        }
      });

      button.on('click', function () {
        clicks.b = 'b';
      });

      button.on('click', function () {
        clicks.c = 'c';
      });

      button.fire('click');

      LegacyUnit.equal(clicks, { a: 'a', b: 'b', c: 'c' });
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
