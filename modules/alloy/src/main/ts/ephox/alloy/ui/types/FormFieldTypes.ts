import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

export interface FormFieldDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  fieldBehaviours: SketchBehaviours;
  prefix: string;
}

export interface FormFieldSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  fieldBehaviours?: AlloyBehaviourRecord;
  prefix?: string;
}

export interface FormFieldApis {
  getField: (container: AlloyComponent) => Option<AlloyComponent>;
  getLabel: (container: AlloyComponent) => Option<AlloyComponent>;
}

export interface FormFieldSketcher extends CompositeSketch<FormFieldSpec>, FormFieldApis { }
