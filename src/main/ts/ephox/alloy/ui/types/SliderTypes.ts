import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { Cell, Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

export interface SliderValue {
  x: () => number,
  y: () => number
};

export interface SliderModelDetailParts {
  getThumb: (component: AlloyComponent) => AlloyComponent,
  getSpectrum: (component: AlloyComponent) => AlloyComponent,
  getLeftEdge: (component: AlloyComponent) => Option<AlloyComponent>,
  getRightEdge: (component: AlloyComponent) => Option<AlloyComponent>,
  getTopEdge: (component: AlloyComponent) => Option<AlloyComponent>,
  getBottomEdge: (component: AlloyComponent) => Option<AlloyComponent>
}

// TODO: Fully type these out.
export interface SliderModelDetailManager {
  setValueTo: (spectrum: AlloyComponent, value: SliderValue) => void,
  getValueFromEvent: (simulatedEvent: NativeSimulatedEvent) => number | SliderValue,
  setPositionFromValue: (slider: AlloyComponent, thumb: AlloyComponent, detail: SliderDetail, parts: SliderModelDetailParts) => void,
  onLeft,
  onRight,
  onUp,
  onDown,
  edgeActions
}

export interface SliderModelDetail {
  minX?: () => number,
  maxX?: () => number,
  minY?: () => number,
  maxY?: () => number,
  value: () => Cell<number | SliderValue>,
  getInitialValue: () => () => number | SliderValue,
  manager: () => any
}

export interface SliderDetail extends CompositeSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[];
  sliderBehaviours: () => SketchBehaviours;

  model: () => SliderModelDetail,
  rounded?: () => boolean;
  stepSize: () => number;
  snapToGrid: () => boolean;
  snapStart: () => Option<number>;

  onChange: () => (component: AlloyComponent, thumb: AlloyComponent, value: number | SliderValue) => void;
  onDragStart: () => (component: AlloyComponent, thumb: AlloyComponent) => void;
  onDragEnd: () => (component: AlloyComponent, thumb: AlloyComponent) => void;

  onInit: () => (component: AlloyComponent, thumb: AlloyComponent, spectrum: AlloyComponent, value: number | SliderValue) => void;

  mouseIsDown: () => Cell<boolean>;
}

export interface HorizontalSliderSpecMode {
  mode: string;
  minX?: number;
  maxX?: number;
  getInitialValue: () => number;
}

export interface VerticalSliderSpecMode {
  mode: string;
  minY?: number;
  maxY?: number;
  getInitialValue: () => number;
}

export interface TwoDSliderSpecMode {
  mode: string;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  getInitialValue: () => SliderValue;
}

export interface SliderSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  sliderBehaviours?: AlloyBehaviourRecord;

  model: HorizontalSliderSpecMode | VerticalSliderSpecMode | TwoDSliderSpecMode,
  stepSize?: number;
  snapToGrid?: boolean;
  snapStart?: number;
  rounded?: boolean;

  onChange?: (component: AlloyComponent, thumb: AlloyComponent, value: SliderValue) => void;
  onDragStart?: (component: AlloyComponent, thumb: AlloyComponent) => void;
  onDragEnd?: (component: AlloyComponent, thumb: AlloyComponent) => void;

  onInit?: (component: AlloyComponent, thumb: AlloyComponent, spectrum: AlloyComponent, value: SliderValue) => void;
}

export interface SliderSketcher extends CompositeSketch<SliderSpec, SliderDetail> {
  resetToMin: (slider: AlloyComponent) => void;
  resetToMax: (slider: AlloyComponent) => void;
  refresh: (slider: AlloyComponent) => void;
}