import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { MouseEvent } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';

import * as Boxes from '../../alien/Boxes';
import DelayedFunction from '../../alien/DelayedFunction';
import { SugarEvent, SugarPosition } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import { Container } from '../../api/ui/Container';
import * as Fields from '../../data/Fields';
import * as BlockerUtils from '../common/BlockerUtils';
import * as DragMovement from '../common/DragMovement';
import { DraggingState } from '../common/DraggingTypes';
import { calcStartData } from '../common/DragUtils';
import SnapSchema from '../common/SnapSchema';
import * as Snappables from '../snap/Snappables';
import * as BlockerEvents from './BlockerEvents';
import * as MouseData from './MouseData';
import { DragApi, MouseDraggingConfig } from './MouseDraggingTypes';

const handlers = (dragConfig: MouseDraggingConfig, dragState: DraggingState<SugarPosition>): AlloyEvents.AlloyEventRecord => {
  const updateStartState = (comp: AlloyComponent) => {
    dragState.setStartData(calcStartData(dragConfig, comp));
  };

  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.windowScroll(), updateStartState),
    AlloyEvents.run<SugarEvent>(NativeEvents.mousedown(), (component, simulatedEvent) => {
      const raw = simulatedEvent.event().raw() as MouseEvent;
      if (raw.button !== 0) { return; }
      simulatedEvent.stop();

      const dragApi: DragApi = {
        drop () {
          stop();
        },
        delayDrop () {
          delayDrop.schedule();
        },
        forceDrop () {
          stop();
        },
        move (event: SugarEvent) {
          // Stop any pending drops caused by mouseout
          delayDrop.cancel();
          const delta = dragState.update(MouseData, event);
          const dragStartData = dragState.getStartData().getOrThunk(() => calcStartData(dragConfig, component));
          delta.each((dlt) => {
            DragMovement.dragBy(component, dragConfig, dragStartData, dlt);
          });
        }
      };

      const blocker = component.getSystem().build(
        Container.sketch({
          dom: {
            // Probably consider doing with classes?
            styles: {
              'left': '0px',
              'top': '0px',
              'width': '100%',
              'height': '100%',
              'position': 'fixed',
              'z-index': '1000000000000000'
            },
            classes: [ dragConfig.blockerClass ]
          },
          events: BlockerEvents.init(dragApi)
        })
      );

      const stop = () => {
        BlockerUtils.discard(blocker);
        dragConfig.snaps.each((snapInfo) => {
          Snappables.stopDrag(component, snapInfo);
        });
        const target = dragConfig.getTarget(component.element());
        dragState.reset();
        dragConfig.onDrop(component, target);
      };

      // If the user has moved something outside the area, and has not come back within
      // 200 ms, then drop
      const delayDrop = DelayedFunction(stop, 200);

      const start = () => {
        updateStartState(component);
        BlockerUtils.instigate(component, blocker);
      };

      start();
    })
  ]);
};

const schema: FieldProcessorAdt[] = [
  // TODO: Is this used?
  FieldSchema.defaulted('useFixed', Fun.never),
  FieldSchema.strict('blockerClass'),
  FieldSchema.defaulted('getTarget', Fun.identity),
  FieldSchema.defaulted('onDrag', Fun.noop),
  FieldSchema.defaulted('repositionTarget', true),
  Fields.onHandler('onDrop'),
  FieldSchema.defaultedFunction('getBounds', Boxes.win),
  SnapSchema,
  Fields.output('dragger', {
    handlers
  })
];

export default schema;
