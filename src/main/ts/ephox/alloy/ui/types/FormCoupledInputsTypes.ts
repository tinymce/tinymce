import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

export interface FormCoupledInputsDetail extends CompositeSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
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