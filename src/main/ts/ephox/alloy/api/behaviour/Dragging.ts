import { Option, Struct } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { CoordAdt } from '../../api/data/DragCoord';
import { AlloyEventKeyAndHandler } from '../../api/events/AlloyEvents';

import * as DraggingBranches from '../../behaviour/dragging/DraggingBranches';
import * as DragState from '../../dragging/common/DragState';
import * as Behaviour from './Behaviour';
import { DraggingBehaviour } from '../../dragging/common/DraggingTypes';

const Dragging = Behaviour.createModes({
  branchKey: 'mode',
  branches: DraggingBranches,
  name: 'dragging',
  active: {
    events (dragConfig, dragState) {
      const dragger = dragConfig.dragger();
      return dragger.handlers(dragConfig, dragState);
    }
  },
  extra: {
    // Extra. Does not need component as input.
    snap: Struct.immutableBag([ 'sensor', 'range', 'output' ], [ 'extra' ])
  },
  state: DragState
}) as DraggingBehaviour;

export {
  Dragging
};