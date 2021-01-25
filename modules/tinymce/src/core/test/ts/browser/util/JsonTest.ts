import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import JSON from 'tinymce/core/api/util/JSON';

describe('browser.tinymce.core.util.JsonTest', () => {
  it('serialize', () => {
    assert.equal(
      JSON.serialize({
        'arr1': [ 1, 2, 3, [ 1, 2, 3 ]],
        'bool1': true,
        'float1': 3.14,
        'int1': 123,
        'null1': null,
        'obj1': { key1: 'val1', key2: 'val2' },
        '\"obj2': { key1: undefined },
        'str1': `"'abc\u00C5123\\`,
        'date1': new Date(0)
      }
      ),
      '{"arr1":[1,2,3,[1,2,3]],"bool1":true,"float1":3.14,"int1":123,"null1":null,' +
      `"obj1":{"key1":"val1","key2":"val2"},"\\"obj2":{},"str1":"\\"'abc\\u00c5123\\\\",` +
      '"date1":"1970-01-01T00:00:00.000Z"}'
    );
  });

  it('parse', () => {
    const parsedValue = JSON.parse('{"arr1":[1,2,3,[1,2,3]],"bool1":true,"float1":3.14,"int1":123,"null1":null,' +
      '"obj1":{"key1":"val1","key2":"val2"},"\\"obj2":{},"str1":"abc\\u00c5123","date1":"1970-01-01T00:00:00.000Z"}');
    assert.deepEqual(parsedValue.arr1, [ 1, 2, 3, [ 1, 2, 3 ]]);
    assert.isTrue(parsedValue.bool1);
    assert.equal(parsedValue.float1, 3.14);
    assert.equal(parsedValue.int1, 123);
    assert.isNull(parsedValue.null1);
    assert.deepEqual(parsedValue.obj1, { key1: 'val1', key2: 'val2' });
    assert.deepEqual(parsedValue['\"obj2'], { });
    assert.equal(parsedValue.str1, 'abc\u00c5123');
    assert.equal(parsedValue.date1, '1970-01-01T00:00:00.000Z');
  });
});
