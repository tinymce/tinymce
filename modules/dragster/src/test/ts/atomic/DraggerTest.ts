import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { SugarElement, SugarPosition } from '@ephox/sugar';

import { DragApi, DragMode, DragSink } from 'ephox/dragster/api/DragApis';
import * as Dragging from 'ephox/dragster/core/Dragging';

UnitTest.test('DraggerTest', () => {
  let optApi: Optional<DragApi<any>> = Optional.none();

  const argumentToStart: any = 'start';
  const argumentToMutate: any = 'mutate';

  const mutations: number[] = [ ];

  const mode = DragMode({
    compare: (old: any, nu: any) => (nu - old) as unknown as SugarPosition,
    extract: (raw: any) => Optional.from(parseInt(raw, 10) as unknown as SugarPosition),
    mutate: (mutation, data) => {
      Assert.eq('', argumentToMutate, mutation);
      mutations.push(data as any as number);
    },
    sink: (dragApi, _settings) => {
      optApi = Optional.some(dragApi);
      return DragSink({
        element: () => 'element' as unknown as SugarElement<HTMLElement>, // fake element
        start: (v) => {
          Assert.eq('', argumentToStart, v);
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
  Assert.eq('', [ ], mutations);
  api.move('10' as any);
  Assert.eq('', [ ], mutations);
  api.move('20' as any);
  Assert.eq('', [ ], mutations);

  dragging.on();
  // The first value is only used for calibration
  api.move('15' as any);
  Assert.eq('', [ ], mutations);
  api.move('20' as any);
  Assert.eq('', [ 20 - 15 ], mutations);
  api.move('21' as any);
  Assert.eq('', [ 20 - 15, 21 - 20 ], mutations);
  api.drop();
  Assert.eq('', [ 20 - 15, 21 - 20 ], mutations);

  // Now that we have dropped, start moving again and check that it isn't logged.
  api.move('22' as any);
  Assert.eq('', [ 20 - 15, 21 - 20 ], mutations);
  api.move('23' as any);
  Assert.eq('', [ 20 - 15, 21 - 20 ], mutations);

  // Now, start it again.
  dragging.go(argumentToStart);
  Assert.eq('', [ 20 - 15, 21 - 20 ], mutations);
  // First one calibrates.
  api.move('24' as any);
  Assert.eq('', [ 20 - 15, 21 - 20 ], mutations);
  api.move('40' as any);
  Assert.eq('', [ 20 - 15, 21 - 20, 40 - 24 ], mutations);
});
