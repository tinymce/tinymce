import { Option } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';

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

export interface FormCoupledInputsSketcher extends CompositeSketch<FormCoupledInputsSpec, FormCoupledInputsDetail> {
  getField1: (comp: AlloyComponent) => Option<AlloyComponent>;
  getField2: (comp: AlloyComponent) => Option<AlloyComponent>;
  getLock: (comp: AlloyComponent) => Option<AlloyComponent>;
}
