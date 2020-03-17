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

export interface DraggingBehaviour<E> extends Behaviour.AlloyBehaviour<DraggingConfigSpec<E>, DraggingConfig<E>, DraggingState> {
  config: (config: DraggingConfigSpec<E>) => Behaviour.NamedConfiguredBehaviour<DraggingConfigSpec<E>, DraggingConfig<E>, DraggingState>;
  snap: (sConfig: SnapConfigSpec<E>) => SnapConfig<E>;
  snapTo: (component: AlloyComponent, sConfig: SnapConfig<E>) => void;
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

export interface SnapConfig<E> {
  sensor: () => CoordAdt;
  range: () => Position;
  output: () => CoordAdt<Option<number>>;
  extra: () => Option<E>;
}

export interface SnapConfigSpec<E> {
  sensor: CoordAdt;
  range: Position;
  output: CoordAdt<Option<number>>;
  extra?: E;
}

export interface SnapOutput<E> {
  output: () => CoordAdt;
  extra: () => Option<E>;
}

export interface SnapPin<E> {
  coord: CoordAdt;
  extra: Option<E>;
}

export interface SnapsConfig<E> {
  getSnapPoints: (comp: AlloyComponent) => Array<SnapConfig<E>>;
  leftAttr: string;
  topAttr: string;
  onSensor: (component: AlloyComponent, extra: E) => void;
  lazyViewport: (component: AlloyComponent) => Bounds;
  mustSnap: boolean;
}

export interface SnapsConfigSpec<E> {
  getSnapPoints: (comp: AlloyComponent) => Array<SnapConfig<E>>;
  leftAttr: string;
  topAttr: string;
  onSensor?: (component: AlloyComponent, extra: E) => void;
  lazyViewport?: (component: AlloyComponent) => Bounds;
  mustSnap?: boolean;
}

export interface DraggingConfig<E> {
  getTarget: (comp: Element) => Element;
  snaps: Option<SnapsConfig<E>>;
  onDrop: (comp: AlloyComponent, target: Element) => void;
  repositionTarget: boolean;
  onDrag: (comp: AlloyComponent, target: Element, delta: Position) => void;
  getBounds: () => Bounds;
  blockerClass: string;
  dragger: {
    handlers: (dragConfig: DraggingConfig<E>, dragState: DraggingState) => AlloyEvents.AlloyEventRecord;
  };
}

export interface CommonDraggingConfigSpec<E> {
  useFixed?: () => boolean;
  onDrop?: (comp: AlloyComponent, target: Element) => void;
  repositionTarget?: boolean;
  onDrag?: (comp: AlloyComponent, target: Element, delta: Position) => void;
  getTarget?: (elem: Element) => Element;
  getBounds?: () => Bounds;
  snaps?: SnapsConfigSpec<E>;
  blockerClass: string;
}

export type DraggingConfigSpec<E> = MouseDraggingConfigSpec<E> | TouchDraggingConfigSpec<E> | MouseOrTouchDraggingConfigSpec<E>;

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
