asynctest(
  'browser.tinymce.core.ui.ColorButtonTest',
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

    var createColorButton = function (settings) {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.update('');

      return Factory.create(Tools.extend({
        type: 'colorbutton'
      }, settings)).renderTo(viewBlock.get());
    };

    suite.test("colorbutton text, size default", function () {
      var colorButton = createColorButton({ text: 'X' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 42, 30], 4);
    });

    suite.test("colorbutton text, size large", function () {
      var colorButton = createColorButton({ text: 'X', size: 'large' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 44, 39], 4);
    });

    suite.test("colorbutton text, size small", function () {
      var colorButton = createColorButton({ text: 'X', size: 'small' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 39, 23], 4);
    });

    suite.test("colorbutton text, width 100, height 100", function () {
      var colorButton = createColorButton({ text: 'X', width: 100, height: 100 });

      LegacyUnit.equal(UiUtils.rect(viewBlock, colorButton), [0, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, colorButton.getEl().firstChild), [1, 1, 98, 98]);
    });

    suite.test("colorbutton icon, size default", function () {
      var colorButton = createColorButton({ icon: 'test' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 49, 30], 4);
    });

    suite.test("colorbutton icon, size small", function () {
      var colorButton = createColorButton({ icon: 'test', size: 'small' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 43, 24], 4);
    });

    suite.test("colorbutton icon, size large", function () {
      var colorButton = createColorButton({ icon: 'test', size: 'large' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 49, 40], 4);
    });

    suite.test("colorbutton icon, width 100, height 100", function () {
      var colorButton = createColorButton({ icon: 'test', width: 100, height: 100 });

      LegacyUnit.equal(UiUtils.rect(viewBlock, colorButton), [0, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, colorButton.getEl().firstChild), [1, 1, 98, 98]);
    });

    suite.test("colorbutton text & icon, size default", function () {
      var colorButton = createColorButton({ text: 'X', icon: 'test' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 62, 30], 4);
    });

    suite.test("colorbutton text & icon, size large", function () {
      var colorButton = createColorButton({ text: 'X', icon: 'test', size: 'large' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 64, 40], 4);
    });

    suite.test("colorbutton text & icon, size small", function () {
      var colorButton = createColorButton({ text: 'X', icon: 'test', size: 'small' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 58, 24], 4);
    });

    suite.test("colorbutton text & icon, width 100, height 100", function () {
      var colorButton = createColorButton({ text: 'X', icon: 'test', width: 100, height: 100 });

      LegacyUnit.equal(UiUtils.rect(viewBlock, colorButton), [0, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, colorButton.getEl().firstChild), [1, 1, 98, 98]);
    });

    suite.test("colorbutton click event", function () {
      var colorButton, clicks = {};

      colorButton = createColorButton({ text: 'X', onclick: function () {
        clicks.a = 'a';
      } });
      colorButton.renderTo(viewBlock.get());
      colorButton.fire('click', { target: colorButton.getEl() });

      LegacyUnit.equal(clicks, { a: 'a' });
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
