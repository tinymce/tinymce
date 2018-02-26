import Behaviour from './Behaviour';
import DraggingBranches from '../../behaviour/dragging/DraggingBranches';
import DragState from '../../dragging/common/DragState';
import { Struct } from '@ephox/katamari';

export default <any> Behaviour.createModes({
  branchKey: 'mode',
  branches: DraggingBranches,
  name: 'dragging',
  active: {
    events: function (dragConfig, dragState) {
      let dragger = dragConfig.dragger();
      return dragger.handlers(dragConfig, dragState);
    }
  },
  extra: {
    // Extra. Does not need component as input.
    snap: Struct.immutableBag([ 'sensor', 'range', 'output' ], [ 'extra' ])

  },
  state: DragState
});