import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Option } from '@ephox/katamari';
import { Gene } from 'ephox/boss/api/Gene';
import Locator from 'ephox/boss/mutant/Locator';
import Tracks from 'ephox/boss/mutant/Tracks';
import Up from 'ephox/boss/mutant/Up';
import { KAssert } from '@ephox/katamari-assertions';

UnitTest.test('UpTest', () => {
  const family = Tracks.track(
    Gene('A', '_A_', [
      Gene('B', '_B_'),
      Gene('C', '_C_', [
        Gene('D', '_D_', [
          Gene('E', '_E_')
        ]),
        Gene('F', '_F_')
      ])
    ]), Option.none());

  const getId = (x: Gene) => x.id;

  const selectorId = (item: Gene, query: string): Option<string> =>
    Up.selector(item, query).map(getId);

  const closestId = (item: Gene, query: string): Option<string> =>
    Up.closest(item, query).map(getId);

  const d = Locator.byId(family, 'D').getOrDie();
  KAssert.eqSome('eq', 'A', selectorId(d, '_A_'));
  KAssert.eqSome('eq', 'A', closestId(d, '_A_'));
  KAssert.eqSome('eq', 'C', selectorId(d, '_C_'));
  KAssert.eqSome('eq', 'C', closestId(d, '_C_'));
  KAssert.eqNone('eq', selectorId(d, '_D_'));
  KAssert.eqSome('eq', 'D', closestId(d, '_D_'));
  KAssert.eqSome('eq', 'D', closestId(d, '_A_,_D_'));
  KAssert.eqSome('eq', 'D', closestId(d, '_A_,_D_,_B_'));
  KAssert.eqSome('eq', 'C', selectorId(d, '_C_,_A_'));
  KAssert.eqSome('eq', 'C', closestId(d, '_C_,_A_'));
  KAssert.eqSome('eq', 'C', selectorId(d, '_B_,_C_,_A_'));
  KAssert.eqSome('eq', 'C', closestId(d, '_B_,_C_,_A_'));
  KAssert.eqSome('eq', 'C', selectorId(d, '_B_,_A_,_C_'));
  KAssert.eqSome('eq', 'C', closestId(d, '_B_,_A_,_C_'));
  KAssert.eqNone('eq', selectorId(d, '_B_,_Z_'));
  KAssert.eqNone('eq', closestId(d, '_B_,_Z_'));

  KAssert.eqSome('eq', 'A', Up.predicate(d, (item: Gene) => item.id === 'A').map(getId));

  KAssert.eqNone('eq', Up.predicate(d, (item: Gene) => item.id === 'root'));

  const checkAll = (expected: string, start: string) => {
    const actual = Locator.byId(family, start).map((item) => {
      const result = Up.all(item);
      return Arr.map(result, getId).join(',');
    });
    KAssert.eqSome('eq', expected, actual);
  };

  checkAll('D,C,A', 'E');
  checkAll('C,A', 'F');
  checkAll('', 'A');
  checkAll('A', 'B');

  Assert.eq('eq', 'A', Up.top(d).id);
});
