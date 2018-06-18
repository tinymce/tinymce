import { CoordAdt } from "../../api/data/DragCoord";
import * as Behaviour from "../../api/behaviour/Behaviour";
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarPosition, SugarEvent, SugarElement } from "../../alien/TypeDefinitions";
import { MouseDraggingConfigSpec } from "../mouse/MouseDraggingTypes";
import { TouchDraggingConfigSpec } from "../touch/TouchDraggingTypes";

export interface DraggingBehaviour extends Behaviour.AlloyBehaviour<DraggingConfigSpec, DraggingConfig> {
  config: (config: DraggingConfigSpec) => Behaviour.NamedConfiguredBehaviour<DraggingConfigSpec, DraggingConfig>;
  snap: (SnapConfig) => any;
}

export type DraggingMode = 'touch' | 'mouse';
export type SensorCoords = (x: number, y: number) => CoordAdt;
export type OutputCoords = (x: Option<number>, y: Option<number>) => CoordAdt;

export interface SnapConfigSpec {
  sensor: SensorCoords;
  range: (x, y) => PositionCoordinates;
  output: OutputCoords;
}

export interface SnapConfig {
  sensor: () => CoordAdt;
  range: () => SugarPosition;
  output: () => CoordAdt;
  extra: any;
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
  getSnapPoints: () => (AlloyComponent) => SnapConfig[];
  leftAttr: () => string;
  topAttr: () => string;
  onSensor?: () => (component: AlloyComponent, extra: {}) => void;
  lazyViewport?: (component: AlloyComponent) => any;
}

export interface DraggingConfig {
  getTarget: () => (SugarElement) => SugarElement;
  snaps: () => Option<SnapsConfig>
  onDrop: () => (AlloyComponent, SugarElement) => void;
}


// FieldSchema.strict('getSnapPoints'),
// Fields.onHandler('onSensor'),
// FieldSchema.strict('leftAttr'),
// FieldSchema.strict('topAttr'),
// FieldSchema.defaulted('lazyViewport', defaultLazyViewport)
export interface CommonDraggingConfigSpec {
  useFixed?: boolean;
  onDrop?: (AlloyComponent, SugarElement) => void;
  getTarget?: (SugarElement) => SugarElement;
  snaps?: {
    getSnapPoints: (AlloyComponent) => SnapConfig[];
    leftAttr: string;
    topAttr: string;
    onSensor?: (component: AlloyComponent, extra: {}) => void;
    lazyViewport?: (component: AlloyComponent) => any;
  }
}


export type DraggingConfigSpec = MouseDraggingConfigSpec | TouchDraggingConfigSpec;

export interface DragModeDeltas<T> {
  getData: (event: SugarEvent) => Option<T>;
  getDelta: (old: T, nu: T) => T;
}

export interface DraggingState<T> {
  update: (mode: DragModeDeltas<T>, dragEvent: SugarEvent) => Option<T>
  reset: () => void;
}