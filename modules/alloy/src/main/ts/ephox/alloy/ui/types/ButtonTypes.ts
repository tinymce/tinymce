import { Optional } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';
import { SpecialConfigSpec } from '../../keying/KeyingModeTypes';

export interface ButtonDetail extends SingleSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  buttonBehaviours: SketchBehaviours;
  keyingSpecialOverwrite?: SpecialConfigSpec;
  action: Optional<ButtonAction>;
  role: Optional<string>;
  eventOrder: Record<string, string[]>;
}

export type ButtonAction = (comp: AlloyComponent) => void;

export interface ButtonSpec extends SingleSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  buttonBehaviours?: AlloyBehaviourRecord;
  keyingSpecialOverwrite?: SpecialConfigSpec;
  action?: ButtonAction;
  role?: string;
  eventOrder?: Record<string, string[]>;
}

export interface ButtonSketcher extends SingleSketch<ButtonSpec> { }
