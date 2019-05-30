import { assert, UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import * as PositionArray from 'ephox/polaris/api/PositionArray';
import * as Parrays from 'ephox/polaris/test/Parrays';

UnitTest.test('api.PositionArray.get', function () {
  const check = function (expected: Option<string>, input: string[], offset: number) {
    const parray = Parrays.make(input);
    const actual = PositionArray.get(parray, offset);
    expected.fold(function () {
      assert.eq(true, actual.isNone());
    }, function (v) {
      assert.eq(v, actual.getOrDie('getting nothing, expected: ' + v).item());
    });
  };

  check(Option.none(),           [], 0);
  check(Option.some('a'),        ['a'], 0);
  check(Option.some('a'),        ['a'], 1);
  check(Option.none(),           ['a'], 2);
  check(Option.some('cat'),      ['this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow'], 'thiswasaca'.length);
  check(Option.some('tomorrow'), ['this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow'], 'thiswasacattodayandto'.length);
  check(Option.none(),           ['this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow'], 'thiswasacattodayandtomorrow-'.length);
});
