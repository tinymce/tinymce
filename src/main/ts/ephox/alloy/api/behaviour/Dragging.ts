import * as Behaviour from './Behaviour';
import * as DraggingBranches from '../../behaviour/dragging/DraggingBranches';
import * as DragState from '../../dragging/common/DragState';
import { Struct } from '@ephox/katamari';

export default <any> Behaviour.createModes({
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
});