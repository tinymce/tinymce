import { SugarEvent } from '../../alien/TypeDefinitions';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import { BlockerDragApi } from '../common/BlockerTypes';

const init = (dragApi: BlockerDragApi): AlloyEvents.AlloyEventRecord => {
  return AlloyEvents.derive([
    // When the user taps on the blocker, something has probably gone slightly
    // wrong, so we'll just drop for safety. The blocker should really only
    // be there when their finger is already down and not released, so a 'tap'
    AlloyEvents.run(NativeEvents.touchstart(), dragApi.forceDrop),

    // When the user releases their finger on the blocker, that is a drop
    AlloyEvents.run(NativeEvents.touchend(), dragApi.drop),
    AlloyEvents.run(NativeEvents.touchcancel(), dragApi.drop),

    // As the user moves their finger around (while pressed down), we move the
    // component around
    AlloyEvents.run<SugarEvent>(NativeEvents.touchmove(), (comp, simulatedEvent) => {
      dragApi.move(simulatedEvent.event());
    })
  ]);
};

export {
  init
};
