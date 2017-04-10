asynctest(
  'browser.tinymce.core.ui.ControlTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.EventUtils',
    'tinymce.core.EditorManager',
    'tinymce.core.test.UiUtils',
    'tinymce.core.test.ViewBlock',
    'tinymce.core.ui.Api',
    'tinymce.core.ui.Container',
    'tinymce.core.ui.Control',
    'tinymce.core.util.Tools'
  ],
  function (Pipeline, LegacyUnit, DOMUtils, EventUtils, EditorManager, UiUtils, ViewBlock, Api, Container, Control, Tools) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var viewBlock = new ViewBlock();

    // Registers ui widgets to factory
    Api.appendTo({});

    suite.test("Initial states", function () {
      var ctrl;

      ctrl = new Control({});

      // Check initial states
      LegacyUnit.equal(ctrl.disabled(), false);
      LegacyUnit.equal(ctrl.active(), false);
      LegacyUnit.equal(ctrl.visible(), true);
      LegacyUnit.equal(ctrl.text(), undefined);
      LegacyUnit.equal(ctrl.name(), undefined);
      LegacyUnit.equal(ctrl.title(), undefined);
      LegacyUnit.equal(ctrl.parent(), undefined);
      LegacyUnit.equal(ctrl.settings, {});
    });

    suite.test("Settings", function () {
      var ctrl = new Control({
        disabled: true,
        active: true,
        visible: true,
        text: 'Text',
        title: 'Title',
        name: 'Name'
      });

      // Check settings states
      LegacyUnit.equal(ctrl.disabled(), true);
      LegacyUnit.equal(ctrl.active(), true);
      LegacyUnit.equal(ctrl.visible(), true);
      LegacyUnit.equal(ctrl.text(), "Text");
      LegacyUnit.equal(ctrl.name(), "Name");
      LegacyUnit.equal(ctrl.title(), "Title");
      LegacyUnit.equal(ctrl.parent(), undefined);
      LegacyUnit.equal(ctrl.settings, {
        disabled: true,
        active: true,
        visible: true,
        text: 'Text',
        title: 'Title',
        name: 'Name'
      });
    });

    suite.test("Properties", function () {
      var ctrl, cont;

      cont = new Container({});
      ctrl = new Control({});

      // Set all states
      ctrl = ctrl.
        disabled(true).
        active(true).
        visible(true).
        text("Text").
        title("Title").
        name("Name").parent(cont);

      // Check states
      LegacyUnit.equal(ctrl.disabled(), true);
      LegacyUnit.equal(ctrl.active(), true);
      LegacyUnit.equal(ctrl.visible(), true);
      LegacyUnit.equal(ctrl.text(), "Text");
      LegacyUnit.equal(ctrl.name(), "Name");
      LegacyUnit.equal(ctrl.title(), "Title");
      LegacyUnit.equal(ctrl.parent(), cont);
      LegacyUnit.equal(ctrl.settings, {});
    });

    suite.test("Chained methods", function () {
      var ctrl = new Control({});

      // Set all states
      ctrl = ctrl.
        on('click', function () { }).
        off().
        renderTo(viewBlock.get()).
        remove();

      // Check so that the chain worked
      LegacyUnit.equal(ctrl instanceof Control, true);
    });

    suite.test("Events", function () {
      var ctrl, count;

      ctrl = new Control({
        onMyEvent: function () {
          count++;
        },
        callbacks: {
          handler1: function () {
            count++;
          }
        }
      });

      ctrl.on('MyEvent', function (args) {
        LegacyUnit.equal(ctrl, args.control);
        LegacyUnit.equal(ctrl, this);
        LegacyUnit.equal(args.myKey, 'myVal');
      });

      ctrl.fire('MyEvent', { myKey: 'myVal' });

      var countAndBreak = function () {
        count++;
        return false;
      };

      // Bind two events
      ctrl.on('MyEvent2', countAndBreak);
      ctrl.on('MyEvent2', countAndBreak);

      // Check if only one of them was called
      count = 0;
      ctrl.fire('MyEvent2', { myKey: 'myVal' });
      LegacyUnit.equal(count, 1);

      // Fire unbound event
      ctrl.fire('MyEvent3', { myKey: 'myVal' });

      // Unbind all
      ctrl.off();
      count = 0;
      ctrl.fire('MyEvent2', { myKey: 'myVal' });
      LegacyUnit.equal(count, 0, 'Unbind all');

      // Unbind by name
      ctrl.on('MyEvent1', countAndBreak);
      ctrl.on('MyEvent2', countAndBreak);
      ctrl.off('MyEvent2');
      count = 0;
      ctrl.fire('MyEvent1', { myKey: 'myVal' });
      ctrl.fire('MyEvent2', { myKey: 'myVal' });
      LegacyUnit.equal(count, 1);

      // Unbind by name callback
      ctrl.on('MyEvent1', countAndBreak);
      ctrl.on('MyEvent1', function () {
        count++;
      });
      ctrl.off('MyEvent1', countAndBreak);
      count = 0;
      ctrl.fire('MyEvent1', { myKey: 'myVal' });
      LegacyUnit.equal(count, 1);

      // Bind by named handler
      ctrl.off();
      ctrl.on('MyEvent', 'handler1');
      count = 0;
      ctrl.fire('MyEvent', { myKey: 'myVal' });
      LegacyUnit.equal(count, 1);
    });

    suite.test("hasClass,addClass,removeClass", function () {
      var ctrl = new Control({ classes: 'class1 class2 class3' });

      LegacyUnit.equal(ctrl.classes.toString(), 'mce-class1 mce-class2 mce-class3');
      LegacyUnit.equal(ctrl.classes.contains('class1'), true);
      LegacyUnit.equal(ctrl.classes.contains('class2'), true);
      LegacyUnit.equal(ctrl.classes.contains('class3'), true);
      LegacyUnit.equal(ctrl.classes.contains('class4'), false);

      ctrl.classes.add('class4');
      LegacyUnit.equal(ctrl.classes.toString(), 'mce-class1 mce-class2 mce-class3 mce-class4');
      LegacyUnit.equal(ctrl.classes.contains('class1'), true);
      LegacyUnit.equal(ctrl.classes.contains('class2'), true);
      LegacyUnit.equal(ctrl.classes.contains('class3'), true);
      LegacyUnit.equal(ctrl.classes.contains('class4'), true);

      ctrl.classes.remove('class4');
      LegacyUnit.equal(ctrl.classes.toString(), 'mce-class1 mce-class2 mce-class3');
      LegacyUnit.equal(ctrl.classes.contains('class1'), true);
      LegacyUnit.equal(ctrl.classes.contains('class2'), true);
      LegacyUnit.equal(ctrl.classes.contains('class3'), true);
      LegacyUnit.equal(ctrl.classes.contains('class4'), false);

      ctrl.classes.remove('class3').remove('class2');
      LegacyUnit.equal(ctrl.classes.toString(), 'mce-class1');
      LegacyUnit.equal(ctrl.classes.contains('class1'), true);
      LegacyUnit.equal(ctrl.classes.contains('class2'), false);
      LegacyUnit.equal(ctrl.classes.contains('class3'), false);

      ctrl.classes.remove('class3').remove('class1');
      LegacyUnit.equal(ctrl.classes.toString(), '');
      LegacyUnit.equal(ctrl.classes.contains('class1'), false);
      LegacyUnit.equal(ctrl.classes.contains('class2'), false);
      LegacyUnit.equal(ctrl.classes.contains('class3'), false);
    });

    suite.test("encode", function () {
      EditorManager.i18n.add('en', { 'old': '"new"' });
      LegacyUnit.equal(new Control({}).encode('<>"&'), '&#60;&#62;&#34;&#38;');
      LegacyUnit.equal(new Control({}).encode('old'), '&#34;new&#34;');
      LegacyUnit.equal(new Control({}).encode('old', false), 'old');
    });

    suite.test("translate", function () {
      EditorManager.i18n.add('en', { 'old': 'new' });
      LegacyUnit.equal(new Control({}).translate('old'), 'new');
      LegacyUnit.equal(new Control({}).translate('old2'), 'old2');
    });

    viewBlock.attach();
    Pipeline.async({}, suite.toSteps({}), function () {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.detach();
      success();
    }, failure);
  }
);
