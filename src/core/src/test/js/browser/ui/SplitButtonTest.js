asynctest(
  'browser.tinymce.core.ui.SplitButtonTest',
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

    var createSplitButton = function (settings) {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.update('');

      return Factory.create(Tools.extend({
        type: 'splitbutton'
      }, settings)).renderTo(viewBlock.get()).reflow();
    };

    suite.test("splitbutton text, size default", function () {
      var splitButton = createSplitButton({ text: 'X' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 42, 30], 4);
    });

    suite.test("splitbutton text, size large", function () {
      var splitButton = createSplitButton({ text: 'X', size: 'large' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 44, 39], 4);
    });

    suite.test("splitbutton text, size small", function () {
      var splitButton = createSplitButton({ text: 'X', size: 'small' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 36, 23], 4);
    });

    suite.test("splitbutton text, width 100, height 100", function () {
      var splitButton = createSplitButton({ text: 'X', width: 100, height: 100 });

      LegacyUnit.equal(UiUtils.rect(viewBlock, splitButton), [0, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, splitButton.getEl().firstChild), [1, 1, 83, 98]);
    });

    suite.test("splitbutton icon, size default", function () {
      var splitButton = createSplitButton({ icon: 'test' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 50, 30], 4);
    });

    suite.test("splitbutton icon, size small", function () {
      var splitButton = createSplitButton({ icon: 'test', size: 'small' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 45, 24], 4);
    });

    suite.test("splitbutton icon, size large", function () {
      var splitButton = createSplitButton({ icon: 'test', size: 'large' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 49, 40], 4);
    });

    suite.test("splitbutton icon, width 100, height 100", function () {
      var splitButton = createSplitButton({ icon: 'test', width: 100, height: 100 });

      LegacyUnit.equal(UiUtils.rect(viewBlock, splitButton), [0, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, splitButton.getEl().firstChild), [1, 1, 83, 98]);
    });

    suite.test("splitbutton text & icon, size default", function () {
      var splitButton = createSplitButton({ text: 'X', icon: 'test' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 62, 30], 4);
    });

    suite.test("splitbutton text & icon, size large", function () {
      var splitButton = createSplitButton({ text: 'X', icon: 'test', size: 'large' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 64, 40], 4);
    });

    suite.test("splitbutton text & icon, size small", function () {
      var splitButton = createSplitButton({ text: 'X', icon: 'test', size: 'small' });

      UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 60, 24], 5);
    });

    suite.test("splitbutton text & icon, width 100, height 100", function () {
      var splitButton = createSplitButton({ text: 'X', icon: 'test', width: 100, height: 100 });

      LegacyUnit.equal(UiUtils.rect(viewBlock, splitButton), [0, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, splitButton.getEl().firstChild), [1, 1, 83, 98]);
    });

    suite.test("splitbutton click event", function () {
      var splitButton, clicks = {};

      splitButton = createSplitButton({
        text: 'X',
        onclick: function () {
          clicks.a = 'a';
        }
      });

      splitButton.fire('click', { target: splitButton.getEl().firstChild });

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

