import { FieldProcessor } from '@ephox/boulder';
import { Fun, Singleton } from '@ephox/katamari';
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

const events = <E>(dragConfig: TouchDraggingConfig<E>, dragState: DraggingState, updateStartState: (comp: AlloyComponent) => void): Array<AlloyEvents.AlloyEventKeyAndHandler<EventArgs<TouchEvent>>> => {
  const blockerSingleton = Singleton.value<AlloyComponent>();

  const stopBlocking = (component: AlloyComponent) => {
    DragUtils.stop(component, blockerSingleton.get(), dragConfig, dragState);
    blockerSingleton.clear();
  };

  // Android fires events on the component at all times, while iOS initially fires on the component
  // but once moved off the component then fires on the element behind. As such we need to use
  // a blocker and then listen to both touchmove/touchend on both the component and blocker.
  return [
    AlloyEvents.run(NativeEvents.touchstart(), (component, simulatedEvent) => {
      simulatedEvent.stop();

      const stop = () => stopBlocking(component);

      const dragApi: BlockerDragApi<TouchEvent> = {
        drop: stop,
        // delayDrop is not used by touch
        delayDrop: Fun.noop,
        forceDrop: stop,
        move: (event) => {
          DragUtils.move(component, dragConfig, dragState, TouchData, event);
        }
      };

      const blocker = BlockerUtils.createComponent(component, dragConfig.blockerClass, TouchBlockerEvents.init(dragApi));
      blockerSingleton.set(blocker);

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
      stopBlocking(component);
    }),
    AlloyEvents.run(NativeEvents.touchcancel(), stopBlocking)
  ];
};

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
