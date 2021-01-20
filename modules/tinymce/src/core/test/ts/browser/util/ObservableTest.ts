import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Observable from 'tinymce/core/api/util/Observable';
import Tools from 'tinymce/core/api/util/Tools';

describe('browser.tinymce.core.util.ObservableTest', () => {
  it('Event bubbling/removed state', () => {
    let lastName: string | null;
    let lastState: boolean | null;
    let data = '';

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
    assert.strictEqual(lastName, 'click');
    assert.isTrue(lastState);

    lastName = lastState = null;
    inst1.on('click', () => {
      data += 'b';
    });
    assert.isNull(lastName);
    assert.isNull(lastState);

    const inst2 = new Class(inst1);
    inst2.on('click', () => {
      data += 'c';
    });

    inst2.fire('click');
    assert.strictEqual(data, 'cab');

    inst2.on('click', (e) => {
      e.stopPropagation();
    });

    inst2.fire('click');
    assert.strictEqual(data, 'cabc');

    inst1.on('remove', () => {
      data += 'r';
    });
    inst1.removed = true;
    inst1.fire('click');
    inst1.fire('remove');
    assert.strictEqual(data, 'cabcr');
  });
});
