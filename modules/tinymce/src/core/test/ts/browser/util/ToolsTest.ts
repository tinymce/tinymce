import { context, describe, it } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import { assert } from 'chai';

import Tools from 'tinymce/core/api/util/Tools';

describe('browser.tinymce.core.util.ToolsTest', () => {
  it('extend', () => {
    assert.deepEqual({ a: 1, b: 2, c: 3 }, Tools.extend({ a: 1 }, { b: 2 }, { c: 3 }));
    assert.deepEqual({ a: 1, c: 3 }, Tools.extend({ a: 1 }, null, { c: 3 }));
  });

  context('create', () => {
    it('TINY-7358: Multiple calls to create should create different objects', () => {
      // eslint-disable-next-line @tinymce/prefer-fun
      Tools.create('tinymce.temp.class1', { init: () => 'obj1' });
      // eslint-disable-next-line @tinymce/prefer-fun
      Tools.create('tinymce.temp.class2', { init: () => 'obj2' });

      const instance1 = new Global.tinymce.temp.class1();
      const instance2 = new Global.tinymce.temp.class2();

      assert.equal(instance1.init(), 'obj1');
      assert.equal(instance2.init(), 'obj2');

      // Cleanup
      delete Global.tinymce.temp;
    });
  });
});
