import { Cell, Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

export interface SliderDetail extends CompositeSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  sliderBehaviours: () => SketchBehaviours;

  mouseIsDown: () => Cell<boolean>;
  value: () => Cell<number>;

  min: () => number;
  max: () => number;
  stepSize: () => number;
  snapToGrid: () => boolean;
  snapStart: () => Option<number>;

  onChange: () => (component: AlloyComponent, thumb: AlloyComponent, value: number) => void;
  onDragStart: () => (component: AlloyComponent, thumb: AlloyComponent) => void;
  onDragEnd: () => (component: AlloyComponent, thumb: AlloyComponent) => void;

  getInitialValue: () => () => number;
  onInit: () => (component: AlloyComponent, thumb: AlloyComponent, value: Number) => void;
}

export interface SliderSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  sliderBehaviours?: AlloyBehaviourRecord;

  min: number;
  max: number;
  stepSize?: number;
  snapToGrid?: boolean;
  snapStart?: number;

  onChange?: (component: AlloyComponent, thumb: AlloyComponent, value: number) => void;
  onDragStart?: (component: AlloyComponent, thumb: AlloyComponent) => void;
  onDragEnd?: (component: AlloyComponent, thumb: AlloyComponent) => void;

  getInitialValue: () => number;
  onInit?: (component: AlloyComponent, thumb: AlloyComponent, value: Number) => void;
}

export interface SliderSketcher extends CompositeSketch<SliderSpec, SliderDetail> {
  resetToMin: (slider: AlloyComponent) => void;
  resetToMax: (slider: AlloyComponent) => void;
  refresh: (slider: AlloyComponent) => void;
}