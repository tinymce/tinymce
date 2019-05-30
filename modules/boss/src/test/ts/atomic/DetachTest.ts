import { assert, UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import { Gene } from 'ephox/boss/api/Gene';
import Detach from 'ephox/boss/mutant/Detach';
import Logger from 'ephox/boss/mutant/Logger';
import Tracks from 'ephox/boss/mutant/Tracks';

UnitTest.test('DetachTest', function() {

  const check = function (expectedRemain: string, expectedDetach: Option<string>, input: Gene, id: string) {
    const family = Tracks.track(input, Option.none());
    const actualDetach = Detach.detach(family, Gene(id, '.'));
    assert.eq(expectedRemain, Logger.basic(family));
    expectedDetach.fold(() => {
      assert.eq(true, actualDetach.isNone(), 'Expected no detached node');
    }, (expected) => {
      actualDetach.map(Logger.basic).fold(() => {
        assert.fail('Expected detached node to be ' + expected + ' but no node found.');
      }, (actual) => {
        assert.eq(expected, actual);
      })
    });
  };

  check('A(B)', Option.some('C(D(E),F)'),
    Gene('A', '.', [
      Gene('B', '.', []),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.', [])
        ]),
        Gene('F', '.', [])
      ])
    ]), 'C');

  check('A(B,C(D(E)))', Option.some('F'),
    Gene('A', '.', [
      Gene('B', '.', []),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.', [])
        ]),
        Gene('F', '.', [])
      ])
    ]), 'F');

  check('A(B,C(F))', Option.some('D(E)'),
    Gene('A', '.', [
      Gene('B', '.'),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.')
        ]),
        Gene('F', '.')
      ])
    ]), 'D');

  check('A(B,C(D(E),F))', Option.none(), 
    Gene('A', '.', [
      Gene('B', '.'),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.')
        ]),
        Gene('F', '.')
      ])
    ]), 'Z');

  check('A(B,C(D(E)))', Option.some('F'),
    Gene('A', '.', [
      Gene('B', '.'),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.')
        ]),
        Gene('F', '.')
      ])
    ]), 'F');
});

