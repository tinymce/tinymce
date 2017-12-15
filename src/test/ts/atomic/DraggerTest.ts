import DragApis from 'ephox/dragster/api/DragApis';
import Dragging from 'ephox/dragster/core/Dragging';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('DraggerTest', function() {
  var api = null;

  var argumentToStart = 'start';
  var argumentToMutate = 'mutate';

  var mutations = [ ];

  var mode = DragApis.mode({
    compare: function (old, nu) {
      return nu - old;
    },
    extract: function (raw) {
      return Option.from(parseInt(raw, 10));
    },
    mutate: function (mutation, data) {
      assert.eq(argumentToMutate, mutation);
      mutations.push(data);
    },
    sink: function (dragApi, settings) {
      api = dragApi;
      return DragApis.sink({
        element: function () { return 'element'; },
        start: function (v) {
          assert.eq(argumentToStart, v);
        },
        stop: Fun.noop,
        destroy: Fun.noop
      });
    }
    
  });



  var dragging = Dragging.setup(argumentToMutate, mode, {});

  // While dragging is not on, nothing should be collected
  dragging.go(argumentToStart);
  assert.eq([ ], mutations);
  api.move('10');
  assert.eq([ ], mutations);
  api.move('20');
  assert.eq([ ], mutations);

  dragging.on();
  // The first value is only used for calibration
  api.move('15');
  assert.eq([ ], mutations);
  api.move('20');
  assert.eq([ 20 - 15 ], mutations);
  api.move('21');
  assert.eq([ 20 - 15, 21 - 20 ], mutations);
  api.drop();
  assert.eq([ 20 - 15, 21 - 20 ], mutations);

  // Now that we have dropped, start moving again and check that it isn't logged.
  api.move('22');
  assert.eq([ 20 - 15, 21 - 20 ], mutations);
  api.move('23');
  assert.eq([ 20 - 15, 21 - 20 ], mutations);

  // Now, start it again.
  dragging.go(argumentToStart);
  assert.eq([ 20 - 15, 21 - 20 ], mutations);
  // First one calibrates.
  api.move('24');
  assert.eq([ 20 - 15, 21 - 20 ], mutations);
  api.move('40');
  assert.eq([ 20 - 15, 21 - 20, 40 - 24 ], mutations);
});

