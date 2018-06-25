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

export interface PositionUpdate {
  x: () => Option<number>;
  y: () => Option<number>;
}

export interface SliderDetail extends CompositeSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  sliderBehaviours: () => SketchBehaviours;

  mouseIsDown: () => Cell<boolean>;
  value: () => Cell<SliderValue>;
  axisHorizontal?: () => boolean;
  axisVertical?: () => boolean;
  rounded?: () => boolean;

  minX: () => number;
  maxX: () => number;
  minY: () => number;
  maxY: () => number;
  stepSize: () => number;
  snapToGrid: () => boolean;
  snapStart: () => Option<number>;

  onChange: () => (component: AlloyComponent, thumb: AlloyComponent, detail: SliderDetail) => void;
  onDragStart: () => (component: AlloyComponent, thumb: AlloyComponent) => void;
  onDragEnd: () => (component: AlloyComponent, thumb: AlloyComponent) => void;

  getInitialValue: () => () => SliderValue;
  onInit: () => (component: AlloyComponent, thumb: AlloyComponent, detail: SliderDetail) => void;
}

export interface SliderSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  sliderBehaviours?: AlloyBehaviourRecord;

  minX: number;
  maxX: number;
  minY?: number;
  maxY?: number;
  stepSize?: number;
  snapToGrid?: boolean;
  snapStart?: number;

  onChange?: (component: AlloyComponent, thumb: AlloyComponent, detail: SliderDetail) => void;
  onDragStart?: (component: AlloyComponent, thumb: AlloyComponent) => void;
  onDragEnd?: (component: AlloyComponent, thumb: AlloyComponent) => void;

  getInitialValue: () => SliderValue;
  onInit?: (component: AlloyComponent, thumb: AlloyComponent, detail: SliderDetail) => void;
  axisHorizontal?: boolean;
  axisVertical?: boolean;
  rounded?: boolean;
}

export interface SliderSketcher extends CompositeSketch<SliderSpec, SliderDetail> {
  resetToMin: (slider: AlloyComponent) => void;
  resetToMax: (slider: AlloyComponent) => void;
  refresh: (slider: AlloyComponent) => void;
}