import { CoordAdt } from "ephox/alloy/api/data/DragCoord";
import * as Behaviour from "ephox/alloy/api/behaviour/Behaviour";
import { Option } from '@ephox/katamari';
import { AlloyComponent } from "ephox/alloy/api/component/ComponentApi";
import { PositionCoordinates, SugarEvent, SugarElement } from "ephox/alloy/alien/TypeDefinitions";
import { MouseDraggingConfigSpec } from "ephox/alloy/dragging/mouse/MouseDraggingTypes";
import { TouchDraggingConfigSpec } from "ephox/alloy/dragging/touch/TouchDraggingTypes";

export interface DraggingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: DraggingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  snap: (SnapConfig) => any;
}

export type DraggingMode = 'touch' | 'mouse';
export type SensorCoords = (x: number, y: number) => CoordAdt;
export type OutputCoords = (x: Option<number>, y: Option<number>) => CoordAdt;

export interface SnapConfigSpec {
  sensor: SensorCoords;
  range: (x, y) => Coordinates;
  output: OutputCoords;
}

export interface SnapConfig {
  sensor: () => CoordAdt;
  range: () => PositionCoordinates;
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

export interface DragModeDeltas {
  getData: (event: SugarEvent) => Option<PositionCoordinates>;
  getDelta: (old: PositionCoordinates, nu: PositionCoordinates) => PositionCoordinates;
}

export interface DraggingState {
  update: (mode: DragModeDeltas, dragEvent: SugarEvent) => Option<PositionCoordinates>
  reset: () => void;
}