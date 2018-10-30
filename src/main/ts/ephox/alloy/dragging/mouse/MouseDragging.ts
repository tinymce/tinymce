import { FieldProcessorAdt, FieldSchema, FieldPresence, ValueSchema } from '@ephox/boulder';
import { MouseEvent } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';

import DelayedFunction from '../../alien/DelayedFunction';
import { SugarEvent, SugarPosition } from '../../alien/TypeDefinitions';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import { Container } from '../../api/ui/Container';
import * as Fields from '../../data/Fields';
import { DraggingState } from '../../dragging/common/DraggingTypes';
import { DragApi, MouseDraggingConfig } from '../../dragging/mouse/MouseDraggingTypes';
import * as BlockerUtils from '../common/BlockerUtils';
import * as DragMovement from '../common/DragMovement';
import SnapSchema from '../common/SnapSchema';
import * as Snappables from '../snap/Snappables';
import * as BlockerEvents from './BlockerEvents';
import * as MouseData from './MouseData';

const handlers = (dragConfig: MouseDraggingConfig, dragState: DraggingState<SugarPosition>): AlloyEvents.AlloyEventRecord => {
  return AlloyEvents.derive([
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
          delta.each((dlt) => {
            DragMovement.dragBy(component, dragConfig, dlt);
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
        dragConfig.onDrop(component, target);
      };

      // If the user has moved something outside the area, and has not come back within
      // 200 ms, then drop
      const delayDrop = DelayedFunction(stop, 200);

      const start = () => {
        dragState.reset();
        BlockerUtils.instigate(component, blocker);
      };

      start();
    })
  ]);
};

const schema: FieldProcessorAdt[] = [
  // TODO: Is this used?
  FieldSchema.defaulted('useFixed', false),
  FieldSchema.strict('blockerClass'),
  FieldSchema.defaulted('getTarget', Fun.identity),
  FieldSchema.defaulted('onDrag', Fun.noop),
  FieldSchema.defaulted('repositionTarget', true),
  Fields.onHandler('onDrop'),
  SnapSchema,
  Fields.output('dragger', {
    handlers
  })
];

export default schema;