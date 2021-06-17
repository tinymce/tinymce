import { Optional } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

export interface FormCoupledInputsDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  coupledFieldBehaviours: SketchBehaviours;
  field1Name: string;
  field2Name: string;
  locked: boolean;
  onLockedChange: (me: AlloyComponent, other: AlloyComponent, lock: AlloyComponent) => void;
  markers: {
    lockClass: string;
  };
}

export interface FormCoupledInputsSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  coupledFieldBehaviours?: AlloyBehaviourRecord;
  field1Name?: string;
  field2Name?: string;
  locked?: boolean;
  onLockedChange: (me: AlloyComponent, other: AlloyComponent, lock: AlloyComponent) => void;
  markers: {
    lockClass: string;
  };
}

export interface FormCoupledInputsApis {
  getField1: (comp: AlloyComponent) => Optional<AlloyComponent>;
  getField2: (comp: AlloyComponent) => Optional<AlloyComponent>;
  getLock: (comp: AlloyComponent) => Optional<AlloyComponent>;
}

export interface FormCoupledInputsSketcher extends CompositeSketch<FormCoupledInputsSpec>, FormCoupledInputsApis { }
