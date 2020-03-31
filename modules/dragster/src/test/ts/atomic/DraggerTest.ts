import { assert, UnitTest } from '@ephox/bedrock-client';
import { Fun, Option } from '@ephox/katamari';
import { Element, Position } from '@ephox/sugar';
import { DragMode, DragSink, DragApi } from 'ephox/dragster/api/DragApis';
import * as Dragging from 'ephox/dragster/core/Dragging';

UnitTest.test('DraggerTest', function () {
  let optApi: Option<DragApi> = Option.none();

  const argumentToStart: any = 'start';
  const argumentToMutate: any = 'mutate';

  const mutations: number[] = [ ];

  const mode = DragMode({
    compare: (old: any, nu: any) => (nu - old) as unknown as Position,
    extract: (raw: any) => Option.from(parseInt(raw, 10) as unknown as Position),
    mutate: (mutation, data) => {
      assert.eq(argumentToMutate, mutation);
      mutations.push(data as any as number);
    },
    sink: (dragApi, _settings) => {
      optApi = Option.some(dragApi);
      return DragSink({
        element: () => 'element' as unknown as Element, // fake element
        start: (v) => {
          assert.eq(argumentToStart, v);
        },
        stop: Fun.noop,
        destroy: Fun.noop
      });
    }
  });

  const dragging = Dragging.setup(argumentToMutate, mode, {});

  const api = optApi.getOrDie('API not loaded');
  // While dragging is not on, nothing should be collected
  dragging.go(argumentToStart);
  assert.eq([ ], mutations);
  api.move('10' as any);
  assert.eq([ ], mutations);
  api.move('20' as any);
  assert.eq([ ], mutations);

  dragging.on();
  // The first value is only used for calibration
  api.move('15' as any);
  assert.eq([ ], mutations);
  api.move('20' as any);
  assert.eq([ 20 - 15 ], mutations);
  api.move('21' as any);
  assert.eq([ 20 - 15, 21 - 20 ], mutations);
  api.drop();
  assert.eq([ 20 - 15, 21 - 20 ], mutations);

  // Now that we have dropped, start moving again and check that it isn't logged.
  api.move('22' as any);
  assert.eq([ 20 - 15, 21 - 20 ], mutations);
  api.move('23' as any);
  assert.eq([ 20 - 15, 21 - 20 ], mutations);

  // Now, start it again.
  dragging.go(argumentToStart);
  assert.eq([ 20 - 15, 21 - 20 ], mutations);
  // First one calibrates.
  api.move('24' as any);
  assert.eq([ 20 - 15, 21 - 20 ], mutations);
  api.move('40' as any);
  assert.eq([ 20 - 15, 21 - 20, 40 - 24 ], mutations);
});
