asynctest(
  'browser.tinymce.ui.GridLayoutTest',
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

    var resetScroll = function (elm) {
      elm.scrollTop = 0;
      elm.scrollLeft = 0;
    };

    var renderGridPanel = function (settings) {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.update('');

      var panel = Factory.create(Tools.extend({
        type: "panel",
        layout: "grid",
        defaults: { type: 'spacer' }
      }, settings)).renderTo(viewBlock.get()).reflow();

      resetScroll(panel.getEl('body'));

      return panel;
    };

    suite.test("automatic grid size 2x2", function () {
      var panel = renderGridPanel({
        items: [
          { classes: 'red' }, { classes: 'green' },
          { classes: 'blue' }, { classes: 'cyan' }
        ]
      });

      LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 40, 40]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [20, 0, 20, 20]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 20, 20, 20]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[3]), [20, 20, 20, 20]);
    });

    /*
    suite.test("fixed pixel size, automatic grid size 2x2", function() {
      panel = renderGridPanel({
        width: 100, height: 100,
        align: "center",
        items: [
          {classes: 'red'}, {classes: 'green'},
          {classes: 'blue'}, {classes: 'cyan'}
        ]
      });

      LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 200, 200]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 17, 22]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [17, 0, 17, 22]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 22, 16, 22]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[3]), [17, 22, 17, 22]);
    });
    */

    suite.test("spacing: 3, automatic grid size 2x2", function () {
      var panel = renderGridPanel({
        spacing: 3,
        items: [
          { classes: 'red' }, { classes: 'green' },
          { classes: 'blue' }, { classes: 'cyan' }
        ]
      });

      LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 43, 43]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [23, 0, 20, 20]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 23, 20, 20]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[3]), [23, 23, 20, 20]);
    });

    suite.test("padding: 3, automatic grid size 2x2", function () {
      var panel = renderGridPanel({
        padding: 3,
        items: [
          { classes: 'red' }, { classes: 'green' },
          { classes: 'blue' }, { classes: 'cyan' }
        ]
      });

      LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 46, 46]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [3, 3, 20, 20]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [23, 3, 20, 20]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [3, 23, 20, 20]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[3]), [23, 23, 20, 20]);
    });

    suite.test("spacing: 3, padding: 3, automatic grid size 2x2", function () {
      var panel = renderGridPanel({
        padding: 3,
        spacing: 3,
        items: [
          { classes: 'red' }, { classes: 'green' },
          { classes: 'blue' }, { classes: 'cyan' }
        ]
      });

      LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 49, 49]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [3, 3, 20, 20]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [26, 3, 20, 20]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [3, 26, 20, 20]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[3]), [26, 26, 20, 20]);
    });

    suite.test("inner elements 100x100 maxWidth/maxHeight: 118 (overflow W+H)", function () {
      var panel = renderGridPanel({
        autoResize: true,
        autoScroll: true,
        maxWidth: 118,
        maxHeight: 118,
        defaults: {
          type: 'spacer',
          minWidth: 100,
          minHeight: 100
        },
        items: [
          { classes: 'red dotted' }, { classes: 'green dotted' },
          { classes: 'blue dotted' }, { classes: 'cyan dotted' }
        ]
      });

      LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 118, 118]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [100, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 100, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[3]), [100, 100, 100, 100]);
      LegacyUnit.equal(panel.layoutRect().w, 118);
      LegacyUnit.equal(panel.layoutRect().h, 118);
      LegacyUnit.equal(panel.layoutRect().contentW, 200);
      LegacyUnit.equal(panel.layoutRect().contentH, 200);
    });

    suite.test("inner elements: 100x100, padding: 20, spacing: 10, maxWidth/maxHeight: 118 (overflow W+H)", function () {
      var panel = renderGridPanel({
        autoResize: true,
        autoScroll: true,
        maxWidth: 118,
        maxHeight: 118,
        padding: 20,
        spacing: 10,
        defaults: {
          type: 'spacer',
          minWidth: 100,
          minHeight: 100
        },
        items: [
          { classes: 'red dotted' }, { classes: 'green dotted' },
          { classes: 'blue dotted' }, { classes: 'cyan dotted' }
        ]
      });

      LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 118, 118]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [20, 20, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [130, 20, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [20, 130, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[3]), [130, 130, 100, 100]);
      LegacyUnit.equal(panel.layoutRect().w, 118);
      LegacyUnit.equal(panel.layoutRect().h, 118);
      LegacyUnit.equal(panel.layoutRect().contentW, 20 + 200 + 10 + 20);
      LegacyUnit.equal(panel.layoutRect().contentH, 20 + 200 + 10 + 20);
    });

    suite.test("inner elements 100x100 maxWidth: 118 (overflow W)", function () {
      var panel = renderGridPanel({
        autoResize: true,
        autoScroll: true,
        maxWidth: 100,
        defaults: {
          type: 'spacer',
          minWidth: 100,
          minHeight: 100
        },
        items: [
          { classes: 'red dotted' }, { classes: 'green dotted' },
          { classes: 'blue dotted' }, { classes: 'cyan dotted' }
        ]
      });

      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [100, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 100, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[3]), [100, 100, 100, 100]);
      LegacyUnit.equal(panel.layoutRect().contentW, 200);
      LegacyUnit.equal(panel.layoutRect().contentH, 200);
    });

    suite.test("inner elements 100x100 maxHeight: 118 (overflow H)", function () {
      var panel = renderGridPanel({
        autoResize: true,
        autoScroll: true,
        maxHeight: 100,
        defaults: {
          type: 'spacer',
          minWidth: 100,
          minHeight: 100
        },
        items: [
          { classes: 'red dotted' }, { classes: 'green dotted' },
          { classes: 'blue dotted' }, { classes: 'cyan dotted' }
        ]
      });

      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [100, 0, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 100, 100, 100]);
      LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[3]), [100, 100, 100, 100]);
      LegacyUnit.equal(panel.layoutRect().contentW, 200);
      LegacyUnit.equal(panel.layoutRect().contentH, 200);
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
