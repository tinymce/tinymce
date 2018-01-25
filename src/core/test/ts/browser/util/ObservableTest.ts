import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Observable from 'tinymce/core/api/util/Observable';
import Tools from 'tinymce/core/api/util/Tools';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.util.ObservableTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  suite.test('Event bubbling/removed state', function () {
    let lastName, lastState, data = '';

    const Class: any = function (parentObj) {
      this.toggleNativeEvent = function (name, state) {
        lastName = name;
        lastState = state;
      };

      this.parent = function () {
        return parentObj;
      };
    };

    Tools.extend(Class.prototype, Observable);

    const inst1 = new Class();

    inst1.on('click', function () {
      data += 'a';
    });
    LegacyUnit.strictEqual(lastName, 'click');
    LegacyUnit.strictEqual(lastState, true);

    lastName = lastState = null;
    inst1.on('click', function () {
      data += 'b';
    });
    LegacyUnit.strictEqual(lastName, null);
    LegacyUnit.strictEqual(lastState, null);

    const inst2 = new Class(inst1);
    inst2.on('click', function () {
      data += 'c';
    });

    inst2.fire('click');
    LegacyUnit.strictEqual(data, 'cab');

    inst2.on('click', function (e) {
      e.stopPropagation();
    });

    inst2.fire('click');
    LegacyUnit.strictEqual(data, 'cabc');

    inst1.on('remove', function () {
      data += 'r';
    });
    inst1.removed = true;
    inst1.fire('click');
    inst1.fire('remove');
    LegacyUnit.strictEqual(data, 'cabcr');
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
