import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';

import * as GeneralSteps from 'ephox/agar/api/GeneralSteps';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import { TestStore } from 'ephox/agar/api/TestStore';

interface TestData {
  name: string;
  age: number;
  isHappy: boolean;
}

UnitTest.asyncTest('TestStoreTest strings', (success, failure) => {
  const strings = [ 's', 'short', 'string', 'loooooong' ];
  const stringsSorted = Arr.sort(strings);

  const store = TestStore<string>();

  Arr.each(strings, (s) => store.adder(s)());

  store.assertEq('String store', strings);
  store.assertSortedEq('String store sorted', stringsSorted);

  store.clear();
  store.assertEq('empty store', []);

  const sAddItemToStore = () => {
    return Arr.map(strings, (s: string) => {
      return Step.sync(() => {
        store.add(s);
      });
    });
  };

  Pipeline.async({}, [
    GeneralSteps.sequence([
      ...sAddItemToStore(),
      store.sAssertEq('Step string store', strings),
      store.sAssertSortedEq('Step string store sorted', stringsSorted),
      store.sClear,
      store.sAssertEq('Step empty store', [])
    ])
  ], success, failure);
});

UnitTest.asyncTest('TestStoreTest numbers', (success, failure) => {
  const numbers = [ 1, 999, 100000, 77 ];
  const numbersSorted = Arr.sort(numbers);

  const store = TestStore<number>();
  Arr.each(numbers, (s) => store.adder(s)());

  store.assertEq('Number store', numbers);
  store.assertSortedEq('Number store', numbersSorted);

  store.clear();
  store.assertEq('empty store', []);

  const sAddToStore = () => {
    return Arr.map(numbers, (s: number) => {
      return Step.sync(() => {
        store.add(s);
      });
    });
  };

  Pipeline.async({}, [
    GeneralSteps.sequence([
      ...sAddToStore(),
      store.sAssertEq('Step number store', numbers),
      store.sAssertSortedEq('Step number store sorted', numbersSorted),
      store.sClear,
      store.sAssertEq('Step empty store', [])
    ])
  ], success, failure);
});

UnitTest.asyncTest('TestStoreTest objects', (success, failure) => {

  const objects: TestData[] = [
    { name: 'NN', age: 1, isHappy: true },
    { name: 'CCCCCCC', age: 999, isHappy: false },
    { name: 'MMM', age: 20, isHappy: true }
  ];

  const objectsSortedByName = Arr.sort(objects, (a, b) => a.name.length - b.name.length);
  const objectsSortedByAge = Arr.sort(objects, (a, b) => a.age - b.age);
  const objectsSortedByIsHappy = Arr.sort(objects, (a, b) => Number(a.isHappy) - Number(b.isHappy));

  const store = TestStore<TestData>();

  Arr.each(objects, (s) => store.adder(s)());

  store.assertEq('Object store', objects);
  store.assertSortedEq('Object store sorted by name', objectsSortedByName, (a, b) => a.name.length - b.name.length);
  store.assertSortedEq('Object store sorted by age', objectsSortedByAge, (a, b) => a.age - b.age);
  store.assertSortedEq('Object store sorted by is happy', objectsSortedByIsHappy, (a, b) => Number(a.isHappy) - Number(b.isHappy));

  store.clear();
  store.assertEq('empty store', []);

  const sAddItemToStore = () => {
    return Arr.map(objects, (s: TestData) => {
      return Step.sync(() => {
        store.add(s);
      });
    });
  };

  Pipeline.async({}, [
    GeneralSteps.sequence([
      ...sAddItemToStore(),

      store.sAssertEq('Step object store', objects),
      store.sAssertSortedEq('Step object store sorted by name', objectsSortedByName, (a, b) => a.name.length - b.name.length),
      store.sAssertSortedEq('Step object store sorted by age', objectsSortedByAge, (a, b) => a.age - b.age),
      store.sAssertSortedEq('Step object store sorted by is happy', objectsSortedByIsHappy, (a, b) => Number(a.isHappy) - Number(b.isHappy)),

      store.sClear,
      store.sAssertEq('Step empty store', []),
    ])
  ], success, failure);
});
