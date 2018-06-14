import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';

export interface FormCoupledInputsDetail extends CompositeSketchDetail {
  uid: () => string;
  // FIX: Completed DOM tpye.
  dom: () => any;
  components: () => AlloySpec[ ];
  onLockedChange: () => (me: AlloyComponent, other: AlloyComponent, lock: AlloyComponent) => void;
  markers: () => {
    lockClass: () => string;
  }
}

export interface FormCoupledInputsSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  onLockedChange: (me: AlloyComponent, other: AlloyComponent, lock: AlloyComponent) => void;
  markers: {
    lockClass: string;
  }
}

export interface FormCoupledInputsSketcher extends CompositeSketch<FormCoupledInputsSpec, FormCoupledInputsDetail> { }