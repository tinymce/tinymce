asynctest(
  'browser.tinymce.core.ui.ButtonTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.core.dom.EventUtils',
    'tinymce.core.test.ViewBlock',
    'tinymce.core.ui.Api',
    'tinymce.core.ui.Collection',
    'tinymce.core.ui.Factory'
  ],
  function (Pipeline, LegacyUnit, EventUtils, ViewBlock, Api, Collection, Factory) {
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

    suite.test("Constructor", function () {
      LegacyUnit.equal(new Collection().length, 0);
      LegacyUnit.equal(new Collection(panel.find('button').toArray()).length, 12);
      LegacyUnit.equal(new Collection(panel.find('button')).length, 12);
      LegacyUnit.equal(new Collection(panel.find('button:first')[0]).length, 1);
      LegacyUnit.equal(new Collection(panel.find('button:first')[0])[0].type, 'button');
    });

    suite.test("add", function () {
      var collection = new Collection([panel, panel]);

      LegacyUnit.equal(collection.add(panel).length, 3);
      LegacyUnit.equal(collection.add([panel, panel]).length, 5);
    });

    suite.test("set", function () {
      var collection = new Collection([panel, panel]);

      LegacyUnit.equal(collection.set(panel).length, 1);
      LegacyUnit.equal(collection.set([panel, panel]).length, 2);
    });

    suite.test("filter", function () {
      LegacyUnit.equal(panel.find('button').filter('*:first').length, 4);
      LegacyUnit.equal(panel.find('button').filter('buttongroup button').length, 9);
      LegacyUnit.equal(panel.find('button').filter('*').length, 12);
      LegacyUnit.equal(panel.find('button').filter('nomatch').length, 0);
      LegacyUnit.equal(panel.find('button').filter(function (ctrl) {
        return ctrl.settings.name === "button7";
      }).length, 1);
    });

    suite.test("slice", function () {
      LegacyUnit.equal(panel.find('button').slice(1).length, 11);
      LegacyUnit.equal(panel.find('button').slice(1)[0].name(), 'button2');

      LegacyUnit.equal(panel.find('button').slice(0, 1).length, 1);
      LegacyUnit.equal(panel.find('button').slice(0, 1)[0].name(), 'button1');

      LegacyUnit.equal(panel.find('button').slice(-1).length, 1);
      LegacyUnit.equal(panel.find('button').slice(-1)[0].name(), 'button12');

      LegacyUnit.equal(panel.find('button').slice(-2).length, 2);
      LegacyUnit.equal(panel.find('button').slice(-2)[0].name(), 'button11');

      LegacyUnit.equal(panel.find('button').slice(-2, -1).length, 1);
      LegacyUnit.equal(panel.find('button').slice(-2, -1)[0].name(), 'button11');

      LegacyUnit.equal(panel.find('button').slice(1000).length, 0);
      LegacyUnit.equal(panel.find('button').slice(-1000).length, 12);
    });

    suite.test("eq", function () {
      LegacyUnit.equal(panel.find('button').eq(1).length, 1);
      LegacyUnit.equal(panel.find('button').eq(1)[0].name(), 'button2');

      LegacyUnit.equal(panel.find('button').eq(-2).length, 1);
      LegacyUnit.equal(panel.find('button').eq(-2)[0].name(), 'button11');

      LegacyUnit.equal(panel.find('button').eq(1000).length, 0);
    });

    suite.test("each", function () {
      var count;

      count = 0;
      panel.find('button').each(function () {
        count++;
      });

      LegacyUnit.equal(count, 12);

      count = 0;
      panel.find('nomatch').each(function () {
        count++;
      });

      LegacyUnit.equal(count, 0);

      count = 0;
      panel.find('button').each(function (item, index) {
        count += index;
      });

      LegacyUnit.equal(count, 66);

      count = 0;
      panel.find('button').each(function (item) {
        if (item.type === 'button') {
          count++;
        }
      });

      LegacyUnit.equal(count, 12);

      count = 0;
      panel.find('button').each(function (item, index) {
        count++;

        if (index === 3) {
          return false;
        }
      });

      LegacyUnit.equal(count, 4);
    });

    suite.test("toArray", function () {
      LegacyUnit.equal(panel.find('button').toArray().length, 12);
      LegacyUnit.equal(panel.find('button').toArray().concat, Array.prototype.concat);
    });

    suite.test("fire/on/off", function () {
      var value;

      value = 0;
      panel.find('button').off();
      panel.find('button#button1,button#button2').on('test', function (args) {
        value += args.value;
      });
      panel.find('button#button1').fire('test', { value: 42 });
      LegacyUnit.equal(value, 42);

      value = 0;
      panel.find('button').off();
      panel.find('button#button1,button#button2').on('test', function (args) {
        value += args.value;
      });
      panel.find('button').fire('test', { value: 42 });
      LegacyUnit.equal(value, 84);

      value = 0;
      panel.find('button').off();
      panel.find('button#button1,button#button2').on('test', function (args) {
        value += args.value;
      });
      panel.find('button#button1').off('test');
      panel.find('button').fire('test', { value: 42 });
      LegacyUnit.equal(value, 42);

      panel.find('button').off();

      value = 0;
      panel.find('button').fire('test', { value: 42 });
      LegacyUnit.equal(value, 0);
    });

    suite.test("show/hide", function () {
      panel.find('button#button1,button#button2').hide();
      LegacyUnit.equal(panel.find('button:not(:visible)').length, 2);

      panel.find('button#button1').show();
      LegacyUnit.equal(panel.find('button:not(:visible)').length, 1);

      panel.find('button#button2').show();
    });

    suite.test("text", function () {
      LegacyUnit.equal(panel.find('button#button1,button#button2').text(), 'button1');
      LegacyUnit.equal(panel.find('button#button2').text('button2').text(), 'button2');

      LegacyUnit.equal(panel.find('button#button2,button#button3').text('test').text(), 'test');
      LegacyUnit.equal(panel.find('button#button3').text(), 'test');
    });

    suite.test("disabled", function () {
      LegacyUnit.equal(panel.find('button#button1').disabled(), true);
      LegacyUnit.equal(panel.find('button#button2').disabled(), false);
      LegacyUnit.equal(panel.find('button#button2').disabled(true).disabled(), true);

      panel.find('button#button2').disabled(false);
    });

    suite.test("visible", function () {
      LegacyUnit.equal(panel.find('button#button2').visible(), true);
      LegacyUnit.equal(panel.find('button#button2').visible(false).visible(), false);

      panel.find('button#button2').visible(true);
    });

    suite.test("active", function () {
      LegacyUnit.equal(panel.find('button#button2').active(), false);
      LegacyUnit.equal(panel.find('button#button2').active(true).active(), true);

      panel.find('button#button2').active(false);
    });

    suite.test("name", function () {
      LegacyUnit.equal(panel.find('button#button1').name(), 'button1');
      LegacyUnit.equal(panel.find('button#button2').name('buttonX').name(), 'buttonX');

      panel.find('button#buttonX').name('button2');
    });

    suite.test("addClass/removeClass/hasClass", function () {
      panel.find('button#button1').addClass('test');
      LegacyUnit.equal(panel.find('button#button1').hasClass('test'), true);
      LegacyUnit.equal(panel.find('button#button1').hasClass('nomatch'), false);
      panel.find('button#button1').removeClass('test');
      LegacyUnit.equal(panel.find('button#button1').hasClass('test'), false);
    });

    suite.test("prop", function () {
      LegacyUnit.equal(panel.find('button#button1').prop('disabled'), true);
      LegacyUnit.equal(panel.find('button#button1').prop('name'), 'button1');
      LegacyUnit.equal(panel.find('button#button1').prop('name', 'buttonX').prop('name'), 'buttonX');
      panel.find('button#buttonX').prop('name', 'button1');
      LegacyUnit.equal(panel.find('button#button1').prop('missingProperty'), undefined);
    });

    suite.test("exec", function () {
      LegacyUnit.equal(panel.find('button#button1').exec('disabled', false).disabled(), false);
      panel.find('button#button1').disabled(true);
    });

    viewBlock.attach();
    createPanel();
    Pipeline.async({}, suite.toSteps({}), function () {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.detach();
      success();
    }, failure);
  }
);
