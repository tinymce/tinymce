import * as Behaviour from './Behaviour';
import * as DraggingBranches from '../../behaviour/dragging/DraggingBranches';
import * as DragState from '../../dragging/common/DragState';
import { Struct, Option } from '@ephox/katamari';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';
import { EventHandlerConfig } from 'ephox/alloy/api/events/AlloyEvents';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface DraggingBehaviour extends AlloyBehaviour {
  config: (DraggingConfig) => any;
  snap: (SnapConfig) => any;
}

export type DraggingMode = 'touch' | 'mouse';
export interface SnapConfig {
  sensor: (x, y) => any;
  range: (x, y) => any;
  output: (x, y) => any;
}

export interface SnapBehaviour {
  getSnapPoints: () => any[];
  leftAttr: string;
  topAttr: string;
  onSensor: () => (component: AlloyComponent, extra: {}) => void;
  lazyViewport: (component?: AlloyComponent) => any;
}

export interface DraggingConfig<T> extends AlloyBehaviourConfig {
  mode: DraggingMode;
  blockerClass?: string[];
  snaps: (SnapBehaviour) => Option<T>;
  getTarget: (handle: EventHandlerConfig) => any;
  useFixed: boolean;
  onDrop: () => any;
  dragger: () => any;
}

const Dragging: DraggingBehaviour = Behaviour.createModes({
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

export {
  Dragging
};