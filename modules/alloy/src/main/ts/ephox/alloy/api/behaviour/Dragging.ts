import { Struct } from '@ephox/katamari';
import { BehaviourStateInitialiser } from '../../behaviour/common/BehaviourState';

import * as DraggingApis from '../../behaviour/dragging/DraggingApis';
import * as DraggingBranches from '../../behaviour/dragging/DraggingBranches';
import { DraggingBehaviour, DraggingConfig, DraggingState, SnapConfig, SnapConfigSpec } from '../../dragging/common/DraggingTypes';
import * as DragState from '../../dragging/common/DragState';
import * as Behaviour from './Behaviour';

const Dragging: DraggingBehaviour = Behaviour.createModes({
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
    snap: Struct.immutableBag([ 'sensor', 'range', 'output' ], [ 'extra' ]) as (sConfig: SnapConfigSpec) => SnapConfig
  },
  state: DragState as BehaviourStateInitialiser<DraggingConfig, DraggingState>,
  apis: DraggingApis
});

export {
  Dragging
};
