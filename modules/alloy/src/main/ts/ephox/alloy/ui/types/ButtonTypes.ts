import type { Optional } from '@ephox/katamari';

import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import type { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';

export interface ButtonDetail extends SingleSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  buttonBehaviours: SketchBehaviours;
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
  action?: ButtonAction;
  role?: string;
  eventOrder?: Record<string, string[]>;
}

export interface ButtonSketcher extends SingleSketch<ButtonSpec> { }
