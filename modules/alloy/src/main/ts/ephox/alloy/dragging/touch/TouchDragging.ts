import { FieldProcessorAdt } from '@ephox/boulder';
import { Cell, Optional } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as Fields from '../../data/Fields';
import { BlockerDragApi } from '../common/BlockerTypes';
import * as BlockerUtils from '../common/BlockerUtils';
import * as DraggingSchema from '../common/DraggingSchema';
import { DraggingState } from '../common/DraggingTypes';
import * as DragUtils from '../common/DragUtils';
import * as TouchBlockerEvents from './TouchBlockerEvents';
import * as TouchData from './TouchData';
import { TouchDraggingConfig } from './TouchDraggingTypes';

const events = <E>(dragConfig: TouchDraggingConfig<E>, dragState: DraggingState, updateStartState: (comp: AlloyComponent) => void) => {
  const blockerCell = Cell<Optional<AlloyComponent>>(Optional.none());

  // Android fires events on the component at all times, while iOS initially fires on the component
  // but once moved off the component then fires on the element behind. As such we need to use
  // a blocker and then listen to both touchmove/touchend on both the component and blocker.
  return [
    AlloyEvents.run(NativeEvents.touchstart(), (component, simulatedEvent) => {
      simulatedEvent.stop();

      const stop = () => {
        DragUtils.stop(component, blockerCell.get(), dragConfig, dragState);
        blockerCell.set(Optional.none());
      };

      const dragApi: BlockerDragApi<TouchEvent> = {
        drop: stop,
        // delayDrop is not used by touch
        delayDrop() { },
        forceDrop: stop,
        move(event) {
          DragUtils.move(component, dragConfig, dragState, TouchData, event);
        }
      };

      const blocker = BlockerUtils.createComponent(component, dragConfig.blockerClass, TouchBlockerEvents.init(dragApi));
      blockerCell.set(Optional.some(blocker));

      const start = () => {
        updateStartState(component);
        BlockerUtils.instigate(component, blocker);
      };

      start();
    }),
    AlloyEvents.run<EventArgs<TouchEvent>>(NativeEvents.touchmove(), (component, simulatedEvent) => {
      simulatedEvent.stop();
      DragUtils.move(component, dragConfig, dragState, TouchData, simulatedEvent.event);
    }),
    AlloyEvents.run(NativeEvents.touchend(), (component, simulatedEvent) => {
      simulatedEvent.stop();
      DragUtils.stop(component, blockerCell.get(), dragConfig, dragState);
      blockerCell.set(Optional.none());
    }),
    AlloyEvents.run(NativeEvents.touchcancel(), (component) => {
      DragUtils.stop(component, blockerCell.get(), dragConfig, dragState);
      blockerCell.set(Optional.none());
    })
  ];
};

const schema: FieldProcessorAdt[] = [
  ...DraggingSchema.schema,
  Fields.output('dragger', {
    handlers: DragUtils.handlers(events)
  })
];

export {
  events,
  schema
};
