import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import Observable from 'tinymce/core/api/util/Observable';
import Tools from 'tinymce/core/api/util/Tools';

UnitTest.asynctest('browser.tinymce.core.util.ObservableTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  suite.test('Event bubbling/removed state', () => {
    let lastName, lastState, data = '';

    const Class: any = function (parentObj) {
      this.toggleNativeEvent = (name, state) => {
        lastName = name;
        lastState = state;
      };

      this.parent = () => {
        return parentObj;
      };
    };

    Tools.extend(Class.prototype, Observable);

    const inst1 = new Class();

    inst1.on('click', () => {
      data += 'a';
    });
    LegacyUnit.strictEqual(lastName, 'click');
    LegacyUnit.strictEqual(lastState, true);

    lastName = lastState = null;
    inst1.on('click', () => {
      data += 'b';
    });
    LegacyUnit.strictEqual(lastName, null);
    LegacyUnit.strictEqual(lastState, null);

    const inst2 = new Class(inst1);
    inst2.on('click', () => {
      data += 'c';
    });

    inst2.fire('click');
    LegacyUnit.strictEqual(data, 'cab');

    inst2.on('click', (e) => {
      e.stopPropagation();
    });

    inst2.fire('click');
    LegacyUnit.strictEqual(data, 'cabc');

    inst1.on('remove', () => {
      data += 'r';
    });
    inst1.removed = true;
    inst1.fire('click');
    inst1.fire('remove');
    LegacyUnit.strictEqual(data, 'cabcr');
  });

  Pipeline.async({}, suite.toSteps({}), success, failure);
});
