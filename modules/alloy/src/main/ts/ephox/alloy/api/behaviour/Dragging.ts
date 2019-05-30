import { Struct } from '@ephox/katamari';

import * as DraggingBranches from '../../behaviour/dragging/DraggingBranches';
import { DraggingBehaviour } from '../../dragging/common/DraggingTypes';
import * as DragState from '../../dragging/common/DragState';
import * as Behaviour from './Behaviour';

const Dragging = Behaviour.createModes({
  branchKey: 'mode',
  branches: DraggingBranches,
  name: 'dragging',
  active: {
    events (dragConfig, dragState) {
      const dragger = dragConfig.dragger;
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