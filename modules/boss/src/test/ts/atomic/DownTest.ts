import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';

import { Gene } from 'ephox/boss/api/Gene';
import * as Down from 'ephox/boss/mutant/Down';
import * as Locator from 'ephox/boss/mutant/Locator';
import * as Tracks from 'ephox/boss/mutant/Tracks';

UnitTest.test('DownTest', () => {
  const family = Tracks.track(
    Gene('1', 'root', [
      Gene('1.1', 'duck', [
        Gene('1.1.1', 'goose', []),
        Gene('1.1.2', 'goose', [
          Gene('1.1.2.1', 'duck', []),
          Gene('1.1.2.2', 'duck', [
            Gene('1.1.2.2.1', 'goose', [])
          ])
        ]),
        Gene('1.1.3', 'duck', []),
        Gene('1.1.4', 'duck', [
          Gene('1.1.4.1', 'duck', [])
        ])
      ])
    ]), Optional.none());

  const check = (expected: string[], actual: Gene[]) => {
    Assert.eq('', expected, Arr.map(actual, (item) => {
      return item.id;
    }));
  };

  const checkSelector = (expected: string[], query: string) => {
    const actual = Down.selector(family, query);
    check(expected, actual);
  };

  const checkPredicate = (expected: string[], id: string, predicate: (e: Gene) => boolean) => {
    const start = Locator.byId(family, id).getOrDie('Did not find start: ' + id);
    const actual = Down.predicate(start, predicate);
    check(expected, actual);
  };

  checkSelector([ '1.1.1', '1.1.2', '1.1.2.2.1' ], 'goose');
  checkSelector([ '1.1', '1.1.2.1', '1.1.2.2', '1.1.3', '1.1.4', '1.1.4.1' ], 'duck');
  checkSelector([ '1.1', '1.1.1', '1.1.2', '1.1.2.1', '1.1.2.2', '1.1.2.2.1', '1.1.3', '1.1.4', '1.1.4.1' ], 'duck,goose');
  checkSelector([ '1.1', '1.1.1', '1.1.2', '1.1.2.1', '1.1.2.2', '1.1.2.2.1', '1.1.3', '1.1.4', '1.1.4.1' ], 'root,duck,goose');

  checkPredicate([], '1.1.4', (item) => {
    return item.name.indexOf('g') > -1;
  });

  checkPredicate([ '1.1.1', '1.1.2', '1.1.2.2.1' ], '1.1', (item) => {
    return item.name.indexOf('g') > -1;
  });
});
