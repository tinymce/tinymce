import { FieldProcessor } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import { DelayedFunction } from '../../alien/DelayedFunction';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as Fields from '../../data/Fields';
import { BlockerDragApi } from '../common/BlockerTypes';
import * as BlockerUtils from '../common/BlockerUtils';
import * as DraggingSchema from '../common/DraggingSchema';
import { DraggingState } from '../common/DraggingTypes';
import * as DragUtils from '../common/DragUtils';
import * as MouseBlockerEvents from './MouseBlockerEvents';
import * as MouseData from './MouseData';
import { MouseDraggingConfig } from './MouseDraggingTypes';

const events = <E>(dragConfig: MouseDraggingConfig<E>, dragState: DraggingState, updateStartState: (comp: AlloyComponent) => void): Array<AlloyEvents.AlloyEventKeyAndHandler<EventArgs<MouseEvent>>> => [
  AlloyEvents.run<EventArgs<MouseEvent>>(NativeEvents.mousedown(), (component, simulatedEvent) => {
    const raw = simulatedEvent.event.raw;
    if (raw.button !== 0) {
      return;
    }
    simulatedEvent.stop();

    const stop = () => DragUtils.stop(component, Optional.some(blocker), dragConfig, dragState);

    // If the user has moved something outside the area, and has not come back within
    // 200 ms, then drop
    const delayDrop = DelayedFunction(stop, 200);

    const dragApi: BlockerDragApi<MouseEvent> = {
      drop: stop,
      delayDrop: delayDrop.schedule,
      forceDrop: stop,
      move: (event) => {
        // Stop any pending drops caused by mouseout
        delayDrop.cancel();
        DragUtils.move(component, dragConfig, dragState, MouseData, event);
      }
    };

    const blocker = BlockerUtils.createComponent(component, dragConfig.blockerClass, MouseBlockerEvents.init(dragApi));

    const start = () => {
      updateStartState(component);
      BlockerUtils.instigate(component, blocker);
    };

    start();
  })
];

const schema: FieldProcessor[] = [
  ...DraggingSchema.schema,
  Fields.output('dragger', {
    handlers: DragUtils.handlers(events)
  })
];

export {
  events,
  schema
};
