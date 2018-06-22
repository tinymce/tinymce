import { Cell, Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { RgbaColour } from '@ephox/acid';

export interface PaletteDetail extends CompositeSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  sliderBehaviours: () => SketchBehaviours;


  mouseIsDown: () => Cell<boolean>;
  value: () => Cell<number>;
  colour: () => Cell<RgbaColour>;

  onChange: () => (component: AlloyComponent, thumb: AlloyComponent, value: number) => void;
  onDragStart: () => (component: AlloyComponent, thumb: AlloyComponent) => void;
  onDragEnd: () => (component: AlloyComponent, thumb: AlloyComponent) => void;

  onInit: () => (component: AlloyComponent, thumb: AlloyComponent, value: Number) => void;
}

export interface PaletteSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  paletteBehaviours?: AlloyBehaviourRecord;

  onChange?: (component: AlloyComponent, thumb: AlloyComponent, value: number) => void;
  onDragStart?: (component: AlloyComponent, thumb: AlloyComponent) => void;
  onDragEnd?: (component: AlloyComponent, thumb: AlloyComponent) => void;

  onInit?: (component: AlloyComponent, thumb: AlloyComponent, value: Number) => void;
}

export interface PaletteSketcher extends CompositeSketch<PaletteSpec, PaletteDetail> {
  resetToMin: (slider: AlloyComponent) => void;
  resetToMax: (slider: AlloyComponent) => void;
  refresh: (slider: AlloyComponent) => void;
  refreshColour: (slider: AlloyComponent, colour: RgbaColour) => void;
}