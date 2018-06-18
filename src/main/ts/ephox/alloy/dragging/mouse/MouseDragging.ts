import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import DelayedFunction from '../../alien/DelayedFunction';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import { Container } from '../../api/ui/Container';
import * as Fields from '../../data/Fields';
import * as BlockerUtils from '../common/BlockerUtils';
import * as DragMovement from '../common/DragMovement';
import SnapSchema from '../common/SnapSchema';
import * as Snappables from '../snap/Snappables';
import * as BlockerEvents from './BlockerEvents';
import * as MouseData from './MouseData';
import { MouseDraggingConfig, DragApi } from '../../dragging/mouse/MouseDraggingTypes';
import { SugarEvent, SugarPosition } from '../../alien/TypeDefinitions';
import { DraggingState } from '../../dragging/common/DraggingTypes';

const handlers = (dragConfig: MouseDraggingConfig, dragState: DraggingState<SugarPosition>): AlloyEvents.AlloyEventRecord => {
  return AlloyEvents.derive([
    AlloyEvents.run(NativeEvents.mousedown(), (component, simulatedEvent) => {
      if (simulatedEvent.event().raw().button !== 0) { return; }
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
          delta.each(dragBy);
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
              'opacity': '0.5',
              'background': 'rgb(100, 100, 0)',
              'z-index': '1000000000000000'
            },
            classes: [ dragConfig.blockerClass() ]
          },
          events: BlockerEvents.init(dragApi)
        })
      );

      const dragBy = (delta) => {
        DragMovement.dragBy(component, dragConfig, delta);
      };

      const stop = () => {
        BlockerUtils.discard(blocker);
        dragConfig.snaps().each((snapInfo) => {
          Snappables.stopDrag(component, snapInfo);
        });
        const target = dragConfig.getTarget()(component.element());
        dragConfig.onDrop()(component, target);
      };

      // If the user has moved something outside the area, and has not come back within
      // 200 ms, then drop
      const delayDrop = DelayedFunction(stop, 200);

      const start = () => {
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
  Fields.onHandler('onDrop'),
  SnapSchema,
  Fields.output('dragger', {
    handlers
  })
];

export default <any> schema;