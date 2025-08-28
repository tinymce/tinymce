import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Observable from 'tinymce/core/api/util/Observable';
import Tools from 'tinymce/core/api/util/Tools';

describe('browser.tinymce.core.util.ObservableTest', () => {
  it('Event bubbling/removed state', () => {
    let lastName: string | undefined;
    let lastState: boolean | undefined;
    let data = '';

    class Class implements Observable<any> {
      private readonly parentObj?: Class;
      public removed: boolean = false;
      public hasEventListeners!: Observable<any>['hasEventListeners'];
      public fire!: Observable<any>['fire'];
      public dispatch!: Observable<any>['dispatch'];
      public on!: Observable<any>['on'];
      public off!: Observable<any>['off'];
      public once!: Observable<any>['once'];

      public constructor(parentObj?: Class) {
        Tools.extend(this, Observable);
        this.parentObj = parentObj;
      }

      public toggleNativeEvent = (name: string, state: boolean) => {
        lastName = name;
        lastState = state;
      };

      public parent = () => {
        return this.parentObj;
      };
    }

    const inst1 = new Class();

    inst1.on('click', () => {
      data += 'a';
    });
    assert.strictEqual(lastName, 'click');
    assert.isTrue(lastState);

    lastName = lastState = undefined;
    inst1.on('click', () => {
      data += 'b';
    });
    assert.isUndefined(lastName);
    assert.isUndefined(lastState);

    const inst2 = new Class(inst1);
    inst2.on('click', () => {
      data += 'c';
    });

    inst2.dispatch('click');
    assert.strictEqual(data, 'cab');

    inst2.on('click', (e) => {
      e.stopPropagation();
    });

    inst2.dispatch('click');
    assert.strictEqual(data, 'cabc');

    inst1.on('remove', () => {
      data += 'r';
    });
    inst1.removed = true;
    inst1.dispatch('click');
    inst1.dispatch('remove');
    assert.strictEqual(data, 'cabcr');
  });
});
