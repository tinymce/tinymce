import * as Arr from 'ephox/katamari/api/Arr';
import * as Unique from 'ephox/katamari/api/Unique';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Unique', function () {
  const expected = ['three', 'two', 'one'];

  const check = function (input) {
    assert.eq(expected, Unique.stringArray(input));
  };

  check(['three', 'two', 'one']);
  check(['three', 'three', 'two', 'one']);
  check(['three', 'three', 'two', 'two', 'one']);
  check(['three', 'three', 'two', 'two', 'one', 'one']);
  check(['three', 'three', 'two', 'two', 'one', 'one', 'three']);
  check(['three', 'three', 'two', 'two', 'one', 'one', 'three', 'two']);
  check(['three', 'three', 'two', 'two', 'one', 'one', 'three', 'two', 'one']);

  Jsc.property(
    'The result of a unique test should contain no duplicates',
    Jsc.array(Jsc.nestring),
    function (arr) {
      const unique = Unique.stringArray(arr);
      return Arr.forall(unique, function (x, i) {
        return !Arr.contains(unique.slice(i + 1), x);
      });
    }
  );

  Jsc.property(
    'Unique is idempotent (assuming sorted)',
    Jsc.array(Jsc.nestring),
    function (arr) {
      const once = Unique.stringArray(arr);
      const twice = Unique.stringArray(once);
      return Jsc.eq(Arr.sort(once), Arr.sort(twice));
    }
  );
});
