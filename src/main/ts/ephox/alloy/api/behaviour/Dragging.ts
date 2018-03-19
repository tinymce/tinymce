import { Option, Struct } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { CoordAdt } from '../../api/data/DragCoord';
import { EventHandlerConfig } from '../../api/events/AlloyEvents';

import * as DraggingBranches from '../../behaviour/dragging/DraggingBranches';
import * as DragState from '../../dragging/common/DragState';
import * as Behaviour from './Behaviour';

export interface DraggingBehaviour extends Behaviour.AlloyBehaviour {
  config: <T>(config: DraggingConfig<T>) => { [key: string]: (any) => any };
  snap: (SnapConfig) => any;
}

export type DraggingMode = 'touch' | 'mouse';
export type SensorCoords = (x: number, y: number) => CoordAdt;
export type OutputCoords = (x: Option<number>, y: Option<number>) => CoordAdt;

export interface SnapConfig {
  sensor: SensorCoords;
  range: (x, y) => Coordinates;
  output: OutputCoords;
}

export interface SnapBehaviour {
  getSnapPoints: () => any[];
  leftAttr: string;
  topAttr: string;
  onSensor?: () => (component: AlloyComponent, extra: {}) => void;
  lazyViewport?: (component: AlloyComponent) => any;
}

export interface DraggingConfig<T> {
  mode: DraggingMode;
  blockerClass?: string;                                // modes: mouse
  snaps?: SnapBehaviour;                                // modes: touch, mouse
  getTarget?: (handle: EventHandlerConfig) => any;      // modes: touch, mouse
  useFixed?: boolean;                                   // modes: touch, mouse
  onDrop?: () => any;                                   // modes: touch, mouse
  dragger?: () => any;                                  // modes: touch, mouse
}

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