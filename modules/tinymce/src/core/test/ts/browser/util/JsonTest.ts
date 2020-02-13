import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import JSON from 'tinymce/core/api/util/JSON';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.util.JsonTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  suite.test('serialize', function () {
    LegacyUnit.equal(
      JSON.serialize({
        'arr1': [1, 2, 3, [1, 2, 3]],
        'bool1': true,
        'float1': 3.14,
        'int1': 123,
        'null1': null,
        'obj1': { key1: 'val1', key2: 'val2' },
        '\"obj2': { key1: undefined },
        'str1': '\"\'abc\u00C5123\\',
        'date1': new Date(0)
      }
      ),
      '{"arr1":[1,2,3,[1,2,3]],"bool1":true,"float1":3.14,"int1":123,"null1":null,' +
      '"obj1":{"key1":"val1","key2":"val2"},"\\"obj2":{},"str1":"\\"\'abc\\u00c5123\\\\",' +
      '"date1":"1970-01-01T00:00:00.000Z"}'
    );
  });

  suite.test('parse', function () {
    const parsedValue = JSON.parse('{"arr1":[1,2,3,[1,2,3]],"bool1":true,"float1":3.14,"int1":123,"null1":null,' +
      '"obj1":{"key1":"val1","key2":"val2"},"\\"obj2":{},"str1":"abc\\u00c5123","date1":"1970-01-01T00:00:00.000Z"}');
    LegacyUnit.equal(parsedValue.arr1, [ 1, 2, 3, [1, 2, 3] ]);
    LegacyUnit.equal(parsedValue.bool1, true);
    LegacyUnit.equal(parsedValue.float1, 3.14);
    LegacyUnit.equal(parsedValue.int1, 123);
    LegacyUnit.equal(parsedValue.null1, null);
    LegacyUnit.equal(parsedValue.obj1, { key1: 'val1', key2: 'val2' });
    LegacyUnit.equal(parsedValue['\"obj2'], { });
    LegacyUnit.equal(parsedValue.str1, 'abc\u00c5123');
    LegacyUnit.equal(parsedValue.date1, '1970-01-01T00:00:00.000Z');
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
