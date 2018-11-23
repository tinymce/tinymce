import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import EventUtils from 'tinymce/core/api/dom/EventUtils';
import EditorManager from 'tinymce/core/api/EditorManager';
import ViewBlock from '../module/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Container from 'tinymce/ui/Container';
import Control from 'tinymce/ui/Control';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.ui.ControlTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  Control.translate = function (text) {
    return EditorManager.translate(text);
  };

  // Registers ui widgets to factory
  Api.registerToFactory();

  suite.test('Initial states', function () {
    let ctrl;

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

  suite.test('Settings', function () {
    const ctrl = new Control({
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
    LegacyUnit.equal(ctrl.text(), 'Text');
    LegacyUnit.equal(ctrl.name(), 'Name');
    LegacyUnit.equal(ctrl.title(), 'Title');
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

  suite.test('Properties', function () {
    let ctrl, cont;

    cont = new Container({});
    ctrl = new Control({});

    // Set all states
    ctrl = ctrl.
      disabled(true).
      active(true).
      visible(true).
      text('Text').
      title('Title').
      name('Name').parent(cont);

    // Check states
    LegacyUnit.equal(ctrl.disabled(), true);
    LegacyUnit.equal(ctrl.active(), true);
    LegacyUnit.equal(ctrl.visible(), true);
    LegacyUnit.equal(ctrl.text(), 'Text');
    LegacyUnit.equal(ctrl.name(), 'Name');
    LegacyUnit.equal(ctrl.title(), 'Title');
    LegacyUnit.equal(ctrl.parent(), cont);
    LegacyUnit.equal(ctrl.settings, {});
  });

  suite.test('Chained methods', function () {
    let ctrl = new Control({});

    // Set all states
    ctrl = ctrl.
      on('click', function () { }).
      off().
      renderTo(viewBlock.get()).
      remove();

    // Check so that the chain worked
    LegacyUnit.equal(ctrl instanceof Control, true);
  });

  suite.test('Events', function () {
    let ctrl, count;

    ctrl = new Control({
      onMyEvent () {
        count++;
      },
      callbacks: {
        handler1 () {
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

    const countAndBreak = function () {
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

  suite.test('hasClass,addClass,removeClass', function () {
    const ctrl = new Control({ classes: 'class1 class2 class3' });

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

  suite.test('encode', function () {
    EditorManager.i18n.add('en', { old: '"new"' });
    LegacyUnit.equal(new Control({}).encode('<>"&'), '&#60;&#62;&#34;&#38;');
    LegacyUnit.equal(new Control({}).encode('old'), '&#34;new&#34;');
    LegacyUnit.equal(new Control({}).encode('old', false), 'old');
  });

  suite.test('translate', function () {
    EditorManager.i18n.add('en', { old: 'new' });
    LegacyUnit.equal(new Control({}).translate('old'), 'new');
    LegacyUnit.equal(new Control({}).translate('old2'), 'old2');
  });

  viewBlock.attach();
  Pipeline.async({}, suite.toSteps({}), function () {
    EventUtils.Event.clean(viewBlock.get());
    viewBlock.detach();
    success();
  }, failure);
});
