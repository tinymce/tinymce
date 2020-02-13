import { Option } from '@ephox/katamari';
import { Element, EventArgs, Position } from '@ephox/sugar';

import { Bounds } from '../../alien/Boxes';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { CoordAdt } from '../../api/data/DragCoord';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import { BehaviourState } from '../../behaviour/common/BehaviourState';
import { MouseDraggingConfigSpec } from '../mouse/MouseDraggingTypes';
import { MouseOrTouchDraggingConfigSpec } from '../mouseortouch/MouseOrTouchDraggingTypes';
import { TouchDraggingConfigSpec } from '../touch/TouchDraggingTypes';

export interface DraggingBehaviour extends Behaviour.AlloyBehaviour<DraggingConfigSpec, DraggingConfig, DraggingState> {
  config: (config: DraggingConfigSpec) => Behaviour.NamedConfiguredBehaviour<DraggingConfigSpec, DraggingConfig, DraggingState>;
  snap: (sConfig: SnapConfigSpec) => SnapConfig;
  snapTo: (component: AlloyComponent, sConfig: SnapConfig) => void;
}

/*
 * Current dragging modes supported:
 *  - mouse: Will allow dragging when using mouse events only
 *  - touch: Will allow dragging when using touch events only
 *  - mouseOrTouch: Will allow dragging with both mouse and touch events
 */
export type DraggingMode = 'touch' | 'mouse' | 'mouseOrTouch';
export type SensorCoords = (x: number, y: number) => CoordAdt;
export type OutputCoords = (x: Option<number>, y: Option<number>) => CoordAdt;

export interface SnapConfig {
  sensor: () => CoordAdt;
  range: () => Position;
  output: () => CoordAdt<Option<number>>;
  extra: () => any;
}

export interface SnapConfigSpec {
  sensor: CoordAdt;
  range: Position;
  output: CoordAdt<Option<number>>;
  extra?: any;
}

export interface SnapOutput {
  output: () => CoordAdt;
  extra: any;
}

export interface SnapPin {
  coord: CoordAdt;
  extra: any;
}

export interface SnapsConfig {
  getSnapPoints: (comp: AlloyComponent) => SnapConfig[];
  leftAttr: string;
  topAttr: string;
  onSensor: (component: AlloyComponent, extra: any) => void;
  lazyViewport: (component: AlloyComponent) => Bounds;
  mustSnap: boolean;
}

export interface SnapsConfigSpec {
  getSnapPoints: (comp: AlloyComponent) => SnapConfig[];
  leftAttr: string;
  topAttr: string;
  onSensor?: (component: AlloyComponent, extra: any) => void;
  lazyViewport?: (component: AlloyComponent) => Bounds;
  mustSnap?: boolean;
}

export interface DraggingConfig {
  getTarget: (comp: Element) => Element;
  snaps: Option<SnapsConfig>;
  onDrop: (comp: AlloyComponent, target: Element) => void;
  repositionTarget: boolean;
  onDrag: (comp: AlloyComponent, target: Element, delta: Position) => void;
  getBounds: () => Bounds;
  blockerClass: string;
  dragger: {
    handlers: (dragConfig: DraggingConfig, dragState: DraggingState) => AlloyEvents.AlloyEventRecord
  };
}

export interface CommonDraggingConfigSpec {
  useFixed?: () => boolean;
  onDrop?: (comp: AlloyComponent, target: Element) => void;
  repositionTarget?: boolean;
  onDrag?: (comp: AlloyComponent, target: Element, delta: Position) => void;
  getTarget?: (elem: Element) => Element;
  getBounds?: () => Bounds;
  snaps?: SnapsConfigSpec;
  blockerClass: string;
}

export type DraggingConfigSpec = MouseDraggingConfigSpec | TouchDraggingConfigSpec | MouseOrTouchDraggingConfigSpec;

export interface DragModeDeltas<T> {
  getData: (event: EventArgs) => Option<T>;
  getDelta: (old: T, nu: T) => T;
}

export interface DragStartData {
  width: number;
  height: number;
  bounds: Bounds;
}

export interface BaseDraggingState<T> extends BehaviourState {
  update: (mode: DragModeDeltas<T>, dragEvent: EventArgs) => Option<T>;
  setStartData: (data: DragStartData) => void;
  getStartData: () => Option<DragStartData>;
  reset: () => void;
}

export interface DraggingState extends BaseDraggingState<Position> { }
