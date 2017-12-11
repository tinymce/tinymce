import Locator from 'ephox/boss/mutant/Locator';
import Logger from 'ephox/boss/mutant/Logger';
import Removal from 'ephox/boss/mutant/Removal';
import Tracks from 'ephox/boss/mutant/Tracks';
import { Option } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('RemovalTest', function() {
  var data = function () {
    return {
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
    };
  };

  var check = function (expected, input, itemId) {
    var family = Tracks.track(input, Option.none());
    var item = Locator.byId(family, itemId).getOrDie();
    Removal.unwrap(item);
    assert.eq(expected, Logger.basic(family));
  };

  check('A(B,D(E),F)', data(), 'C');
  check('A(B,C(D,F))', data(), 'E');
});

