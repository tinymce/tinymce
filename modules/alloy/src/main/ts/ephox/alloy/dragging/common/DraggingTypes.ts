import { Event } from '@ephox/dom-globals';
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
  readonly sensor: CoordAdt;
  readonly range: Position;
  readonly output: CoordAdt<Option<number>>;
  readonly extra: Option<E>;
}

export interface SnapConfigSpec<E> {
  readonly sensor: CoordAdt;
  readonly range: Position;
  readonly output: CoordAdt<Option<number>>;
  readonly extra?: E;
}

export interface SnapOutput<E> {
  readonly output: CoordAdt;
  readonly extra: Option<E>;
}

export interface SnapPin<E> {
  readonly coord: CoordAdt;
  readonly extra: Option<E>;
}

export interface SnapsConfig<E> {
  readonly getSnapPoints: (comp: AlloyComponent) => Array<SnapConfig<E>>;
  readonly leftAttr: string;
  readonly topAttr: string;
  readonly onSensor: (component: AlloyComponent, extra: E) => void;
  readonly lazyViewport: (component: AlloyComponent) => Bounds;
  readonly mustSnap: boolean;
}

export interface SnapsConfigSpec<E> {
  readonly getSnapPoints: (comp: AlloyComponent) => Array<SnapConfig<E>>;
  readonly leftAttr: string;
  readonly topAttr: string;
  readonly onSensor?: (component: AlloyComponent, extra: E) => void;
  readonly lazyViewport?: (component: AlloyComponent) => Bounds;
  readonly mustSnap?: boolean;
}

export interface DraggingConfig<E> {
  readonly getTarget: (comp: Element) => Element;
  readonly snaps: Option<SnapsConfig<E>>;
  readonly onDrop: (comp: AlloyComponent, target: Element) => void;
  readonly repositionTarget: boolean;
  readonly onDrag: (comp: AlloyComponent, target: Element, delta: Position) => void;
  readonly getBounds: () => Bounds;
  readonly blockerClass: string;
  readonly dragger: {
    readonly handlers: (dragConfig: DraggingConfig<E>, dragState: DraggingState) => AlloyEvents.AlloyEventRecord;
  };
}

export interface CommonDraggingConfigSpec<E> {
  readonly useFixed?: () => boolean;
  readonly onDrop?: (comp: AlloyComponent, target: Element) => void;
  readonly repositionTarget?: boolean;
  readonly onDrag?: (comp: AlloyComponent, target: Element, delta: Position) => void;
  readonly getTarget?: (elem: Element) => Element;
  readonly getBounds?: () => Bounds;
  readonly snaps?: SnapsConfigSpec<E>;
  readonly blockerClass: string;
}

export type DraggingConfigSpec<E> = MouseDraggingConfigSpec<E> | TouchDraggingConfigSpec<E> | MouseOrTouchDraggingConfigSpec<E>;

export interface DragModeDeltas<E extends Event, T> {
  readonly getData: (event: EventArgs<E>) => Option<T>;
  readonly getDelta: (old: T, nu: T) => T;
}

export interface DragStartData {
  readonly width: number;
  readonly height: number;
  readonly bounds: Bounds;
}

export interface BaseDraggingState<T> extends BehaviourState {
  readonly update: <E extends Event>(mode: DragModeDeltas<E, T>, dragEvent: EventArgs<E>) => Option<T>;
  readonly setStartData: (data: DragStartData) => void;
  readonly getStartData: () => Option<DragStartData>;
  readonly reset: () => void;
}

export interface DraggingState extends BaseDraggingState<Position> { }
