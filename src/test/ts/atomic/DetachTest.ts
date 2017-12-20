import Detach from 'ephox/boss/mutant/Detach';
import Locator from 'ephox/boss/mutant/Locator';
import Logger from 'ephox/boss/mutant/Logger';
import Tracks from 'ephox/boss/mutant/Tracks';
import { Option } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('DetachTest', function() {
  var family = Tracks.track(
  {
    id: 'A',
    children: [
      { id: 'B', children: [ ] },
      { id: 'C', children: [
        { id: 'D', children: [
          { id: 'E', children: [] }
        ]},
        { id: 'F', children: [] }
      ]}
    ]
  }, Option.none());

  var check = function (expected, input, id) {
    var family = Tracks.track(input, Option.none());
    var target = Locator.byId(family, id).getOrDie();
    var actual = Detach.detach(family, target);
    assert.eq(expected, Logger.basic(family));
  };

  var checkNone = function (expected, input, id) {
    var family = Tracks.track(input, Option.none());
    var actual = Detach.detach(family, { id: id });
    assert.eq(false, actual.isSome());
  };

  check('A(B)', {
    id: 'A',
    children: [
      { id: 'B', children: [ ] },
      { id: 'C', children: [
        { id: 'D', children: [
          { id: 'E', children: [] }
        ]},
        { id: 'F', children: [] }
      ]}
    ]
  }, 'C');

  check('A(B,C(D(E)))', {
    id: 'A',
    children: [
      { id: 'B', children: [ ] },
      { id: 'C', children: [
        { id: 'D', children: [
          { id: 'E', children: [] }
        ]},
        { id: 'F', children: [] }
      ]}
    ]
  }, 'F');

  check('A(B,C(F))', {
    id: 'A',
    children: [
      { id: 'B', children: [ ] },
      { id: 'C', children: [
        { id: 'D', children: [
          { id: 'E', children: [] }
        ]},
        { id: 'F', children: [] }
      ]}
    ]
  }, 'D');

  checkNone('A(B)', {
    id: 'A',
    children: [
      { id: 'B', children: [ ] },
      { id: 'C', children: [
        { id: 'D', children: [
          { id: 'E', children: [] }
        ]},
        { id: 'F', children: [] }
      ]}
    ]
  }, 'Z');

  check('A(B,C(D(E)))', {
    id: 'A',
    children: [
      { id: 'B', children: [ ] },
      { id: 'C', children: [
        { id: 'D', children: [
          { id: 'E', children: [] }
        ]},
        { id: 'F', children: [] }
      ]}
    ]
  }, 'F');
});

