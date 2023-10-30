import { Cell, Optional } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { CustomEvent, NativeSimulatedEvent } from '../../events/SimulatedEvent';

export type SliderValueX = number;

export type SliderValueY = number;

export interface SliderValueXY {
  readonly x: number;
  readonly y: number;
}

export type SliderValue = SliderValueX | SliderValueY | SliderValueXY;

export interface SliderUpdateEvent extends CustomEvent {
  value: SliderValue;
}

export interface SliderModelDetailParts {
  getSpectrum: (component: AlloyComponent) => AlloyComponent;
  getLeftEdge: (component: AlloyComponent) => Optional<AlloyComponent>;
  getRightEdge: (component: AlloyComponent) => Optional<AlloyComponent>;
  getTopEdge: (component: AlloyComponent) => Optional<AlloyComponent>;
  getBottomEdge: (component: AlloyComponent) => Optional<AlloyComponent>;
}

export interface EdgeActions {
  'top-left': Optional<(edge: AlloyComponent, detail: SliderDetail) => void>;
  'top': Optional<(edge: AlloyComponent, detail: SliderDetail) => void>;
  'top-right': Optional<(edge: AlloyComponent, detail: SliderDetail) => void>;
  'right': Optional<(edge: AlloyComponent, detail: SliderDetail) => void>;
  'bottom-right': Optional<(edge: AlloyComponent, detail: SliderDetail) => void>;
  'bottom': Optional<(edge: AlloyComponent, detail: SliderDetail) => void>;
  'bottom-left': Optional<(edge: AlloyComponent, detail: SliderDetail) => void>;
  'left': Optional<(edge: AlloyComponent, detail: SliderDetail) => void>;
}

export interface Manager {
  setValueFrom: (spectrum: AlloyComponent, detail: SliderDetail, value: number | SugarPosition) => void;
  setToMin: (spectrum: AlloyComponent, detail: SliderDetail) => void;
  setToMax: (spectrum: AlloyComponent, detail: SliderDetail) => void;
  getValueFromEvent: (simulatedEvent: NativeSimulatedEvent<MouseEvent | TouchEvent>) => Optional<number | SugarPosition>;
  setPositionFromValue: (slider: AlloyComponent, thumb: AlloyComponent, detail: SliderDetail, parts: SliderModelDetailParts) => void;
  onLeft: (spectrum: AlloyComponent, detail: SliderDetail, useMultiplier?: boolean) => Optional<boolean>;
  onRight: (spectrum: AlloyComponent, detail: SliderDetail, useMultiplier?: boolean) => Optional<boolean>;
  onUp: (spectrum: AlloyComponent, detail: SliderDetail, useMultiplier?: boolean) => Optional<boolean>;
  onDown: (spectrum: AlloyComponent, detail: SliderDetail, useMultiplier?: boolean) => Optional<boolean>;
  edgeActions: EdgeActions;
}

export interface SliderModelDetail {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  value: Cell<SliderValue>;
  getInitialValue: () => SliderValue;
  manager: Manager;
}

export interface VerticalSliderModelDetail extends SliderModelDetail {
  minY: number;
  maxY: number;
}

export interface HorizontalSliderModelDetail extends SliderModelDetail {
  minX: number;
  maxX: number;
}

export interface TwoDSliderModelDetail extends SliderModelDetail {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface SliderDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[];
  sliderBehaviours: SketchBehaviours;

  model: SliderModelDetail;
  rounded: boolean;
  stepSize: number;
  speedMultiplier: number;
  snapToGrid: boolean;
  snapStart: Optional<number>;

  onChange: (component: AlloyComponent, thumb: AlloyComponent, value: number | SliderValue) => void;
  onChoose: (component: AlloyComponent, thumb: AlloyComponent, value: number | SliderValue) => void;
  onDragStart: (component: AlloyComponent, thumb: AlloyComponent) => void;
  onDragEnd: (component: AlloyComponent, thumb: AlloyComponent) => void;

  onInit: (component: AlloyComponent, thumb: AlloyComponent, spectrum: AlloyComponent, value: number | SliderValue) => void;

  mouseIsDown: Cell<boolean>;
}

export interface VerticalSliderDetail extends SliderDetail {
  model: VerticalSliderModelDetail;
}

export interface HorizontalSliderDetail extends SliderDetail {
  model: HorizontalSliderModelDetail;
}

export interface TwoDSliderDetail extends SliderDetail {
  model: TwoDSliderModelDetail;
}

export interface HorizontalSliderSpecMode {
  mode: 'x';
  minX?: number;
  maxX?: number;
  getInitialValue: () => SliderValueX;
}

export interface VerticalSliderSpecMode {
  mode: 'y';
  minY?: number;
  maxY?: number;
  getInitialValue: () => SliderValueY;
}

export interface TwoDSliderSpecMode {
  mode: 'xy';
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  getInitialValue: () => SliderValueXY;
}

export interface SliderSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  sliderBehaviours?: AlloyBehaviourRecord;

  model: HorizontalSliderSpecMode | VerticalSliderSpecMode | TwoDSliderSpecMode;
  stepSize?: number;
  snapToGrid?: boolean;
  snapStart?: number;
  rounded?: boolean;

  onChange?: (component: AlloyComponent, thumb: AlloyComponent, value: SliderValue) => void;
  onChoose?: (component: AlloyComponent, thumb: AlloyComponent, value: SliderValue) => void;
  onDragStart?: (component: AlloyComponent, thumb: AlloyComponent) => void;
  onDragEnd?: (component: AlloyComponent, thumb: AlloyComponent) => void;

  onInit?: (component: AlloyComponent, thumb: AlloyComponent, spectrum: AlloyComponent, value: SliderValue) => void;
}

export interface SliderApis {
  setValue: (slider: AlloyComponent, value: SliderValue) => void;
  resetToMin: (slider: AlloyComponent) => void;
  resetToMax: (slider: AlloyComponent) => void;
  refresh: (slider: AlloyComponent) => void;
}

export interface SliderSketcher extends CompositeSketch<SliderSpec>, SliderApis { }
