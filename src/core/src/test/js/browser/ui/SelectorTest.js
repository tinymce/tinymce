asynctest(
  'browser.tinymce.core.ui.SelectorTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.core.dom.EventUtils',
    'tinymce.core.test.UiUtils',
    'tinymce.core.test.ViewBlock',
    'tinymce.core.ui.Api',
    'tinymce.core.ui.Factory'
  ],
  function (Pipeline, LegacyUnit, EventUtils, UiUtils, ViewBlock, Api, Factory) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var viewBlock = new ViewBlock();
    var panel;

    // Registers ui widgets to factory
    Api.appendTo({});

    var createPanel = function () {
      panel = Factory.create({
        type: 'panel',
        items: [
          { type: 'button', name: 'button1', text: 'button1', classes: 'class1', disabled: true },
          { type: 'button', name: 'button2', classes: 'class1 class2' },
          { type: 'button', name: 'button3', classes: 'class2 class1 class3' },

          {
            type: 'buttongroup', name: 'buttongroup1', items: [
              { type: 'button', name: 'button4' },
              { type: 'button', name: 'button5' },
              { type: 'button', name: 'button6' }
            ]
          },

          {
            type: 'buttongroup', name: 'buttongroup2', items: [
              { type: 'button', name: 'button7' },
              { type: 'button', name: 'button8' },
              { type: 'button', name: 'button9' }
            ]
          },

          {
            type: 'toolbar', name: 'toolbar1', items: [
              {
                type: 'buttongroup', name: 'buttongroup3', items: [
                  { type: 'button', name: 'button10', disabled: true },
                  { type: 'button', name: 'button11' },
                  { type: 'button', name: 'button12', classes: 'class4' }
                ]
              }
            ]
          }
        ]
      }).renderTo(viewBlock.get());
    };

    suite.test("Basic", function () {
      var matches;

      matches = panel.find('button');
      LegacyUnit.equal(matches.length, 12);
      LegacyUnit.equal(matches[0].type, 'button');

      LegacyUnit.equal(panel.find('Button').length, 12);
      LegacyUnit.equal(panel.find('buttongroup').length, 3);
      LegacyUnit.equal(panel.find('buttongroup button').length, 9);
      LegacyUnit.equal(panel.find('toolbar buttongroup button').length, 3);
      LegacyUnit.equal(panel.find('button#button1').length, 1);
      LegacyUnit.equal(panel.find('buttongroup#buttongroup1 button#button4').length, 1);
      LegacyUnit.equal(panel.find('button,button,buttongroup button').length, 12, 'Check unique');
    });

    suite.test("Classes", function () {
      LegacyUnit.equal(panel.find('button.class1').length, 3);
      LegacyUnit.equal(panel.find('button.class1.class2').length, 2);
      LegacyUnit.equal(panel.find('button.class2.class1').length, 2);
      LegacyUnit.equal(panel.find('button.classX').length, 0);
      LegacyUnit.equal(panel.find('button.class1, button.class2').length, 3);
    });

    suite.test("Psuedo:not", function () {
      LegacyUnit.equal(panel.find('button:not(.class1)').length, 9);
      LegacyUnit.equal(panel.find('button:not(buttongroup button)').length, 3);
      LegacyUnit.equal(panel.find('button:not(toolbar button)').length, 9);
      LegacyUnit.equal(panel.find('button:not(toolbar buttongroup button)').length, 9);
      LegacyUnit.equal(panel.find('button:not(panel button)').length, 0);
      LegacyUnit.equal(panel.find('button:not(.class1)').length, 9);
      LegacyUnit.equal(panel.find('button:not(.class3, .class4)').length, 10);
    });

    suite.test("Psuedo:odd/even/first/last", function () {
      var matches;

      matches = panel.find('button:first');

      LegacyUnit.equal(matches.length, 4);
      LegacyUnit.equal(matches[0].name() === 'button1', true);
      LegacyUnit.equal(matches[3].name() === 'button10', true);

      matches = panel.find('button:last');

      LegacyUnit.equal(matches.length, 3);
      LegacyUnit.equal(matches[0].name() === 'button6', true);
      LegacyUnit.equal(matches[1].name() === 'button9', true);

      matches = panel.find('button:odd');

      LegacyUnit.equal(matches.length, 4);
      LegacyUnit.equal(matches[0].name() === 'button2', true);
      LegacyUnit.equal(matches[1].name() === 'button5', true);

      matches = panel.find('button:even');

      LegacyUnit.equal(matches.length, 8);
      LegacyUnit.equal(matches[0].name() === 'button1', true);
      LegacyUnit.equal(matches[1].name() === 'button3', true);
    });

    suite.test("Psuedo:disabled", function () {
      LegacyUnit.equal(panel.find('button:disabled').length, 2);
    });

    suite.test("Attribute value", function () {
      LegacyUnit.equal(panel.find('button[name]').length, 12);
      LegacyUnit.equal(panel.find('button[name=button1]').length, 1);
      LegacyUnit.equal(panel.find('button[name^=button1]').length, 4);
      LegacyUnit.equal(panel.find('button[name$=1]').length, 2);
      LegacyUnit.equal(panel.find('button[name*=utt]').length, 12);
      LegacyUnit.equal(panel.find('button[name!=button1]').length, 11);
    });

    suite.test("Direct descendant", function () {
      LegacyUnit.equal(panel.find('> button').length, 3);
      LegacyUnit.equal(panel.find('toolbar > buttongroup').length, 1);
      LegacyUnit.equal(panel.find('toolbar > button').length, 0);
    });

    suite.test("Parents", function () {
      LegacyUnit.equal(panel.find("#button10")[0].parents("toolbar,buttongroup").length, 2);
      LegacyUnit.equal(panel.find("#button10")[0].parents("panel").length, 1);
    });

    UiUtils.loadSkinAndOverride(viewBlock, function () {
      createPanel();
      Pipeline.async({}, suite.toSteps({}), function () {
        EventUtils.Event.clean(viewBlock.get());
        viewBlock.detach();
        success();
      }, failure);
    });
  }
);
