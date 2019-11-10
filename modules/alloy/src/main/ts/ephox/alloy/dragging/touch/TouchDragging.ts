import { FieldSchema } from '@ephox/boulder';
import { Cell, Fun, Option } from '@ephox/katamari';

import * as Boxes from '../../alien/Boxes';
import { SugarEvent, SugarPosition } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as Fields from '../../data/Fields';
import { BlockerDragApi } from '../common/BlockerTypes';
import * as BlockerUtils from '../common/BlockerUtils';
import { DraggingState } from '../common/DraggingTypes';
import * as DragUtils from '../common/DragUtils';
import SnapSchema from '../common/SnapSchema';
import * as TouchBlockerEvents from './TouchBlockerEvents';
import * as TouchData from './TouchData';
import { TouchDraggingConfig } from './TouchDraggingTypes';

const handlers = (dragConfig: TouchDraggingConfig, dragState: DraggingState<SugarPosition>): AlloyEvents.AlloyEventRecord => {
  const blockerCell = Cell<Option<AlloyComponent>>(Option.none());

  const updateStartState = (comp: AlloyComponent) => {
    dragState.setStartData(DragUtils.calcStartData(dragConfig, comp));
  };

  // Android fires events on the component at all times, while iOS initially fires on the component
  // but once moved off the component then fires on the element behind. As such we need to use
  // a blocker and then listen to both touchmove/touchend on both the component and blocker.
  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.windowScroll(), (comp) => {
      // Only update if we have some start data
      dragState.getStartData().each(() => updateStartState(comp));
    }),
    AlloyEvents.run(NativeEvents.touchstart(), (component, simulatedEvent) => {
      simulatedEvent.stop();

      const stop = () => {
        DragUtils.stop(component, blockerCell.get(), dragConfig, dragState);
        blockerCell.set(Option.none());
      };

      const dragApi: BlockerDragApi = {
        drop: stop,
        // delayDrop is not used by touch
        delayDrop () { },
        forceDrop: stop,
        move (event: SugarEvent) {
          DragUtils.move(component, dragConfig, dragState, TouchData, event);
        }
      };

      const blocker = BlockerUtils.createComponent(component, dragConfig.blockerClass, TouchBlockerEvents.init(dragApi));
      blockerCell.set(Option.some(blocker));

      const start = () => {
        updateStartState(component);
        BlockerUtils.instigate(component, blocker);
      };

      start();
    }),
    AlloyEvents.run<SugarEvent>(NativeEvents.touchmove(), (component, simulatedEvent) => {
      simulatedEvent.stop();
      DragUtils.move(component, dragConfig, dragState, TouchData, simulatedEvent.event());
    }),
    AlloyEvents.run(NativeEvents.touchend(), (component) => {
      DragUtils.stop(component, blockerCell.get(), dragConfig, dragState);
      blockerCell.set(Option.none());
    }),
    AlloyEvents.run(NativeEvents.touchcancel(), (component) => {
      DragUtils.stop(component, blockerCell.get(), dragConfig, dragState);
      blockerCell.set(Option.none());
    })
  ]);
};

const schema = [
  // Is this used?
  FieldSchema.defaulted('useFixed', Fun.never),
  FieldSchema.strict('blockerClass'),
  FieldSchema.defaulted('getTarget', Fun.identity),
  FieldSchema.defaulted('onDrag', Fun.noop),
  FieldSchema.defaulted('repositionTarget', true),
  FieldSchema.defaulted('onDrop', Fun.noop),
  FieldSchema.defaultedFunction('getBounds', Boxes.win),
  SnapSchema,
  Fields.output('dragger', {
    handlers
  })
];

export default schema;
