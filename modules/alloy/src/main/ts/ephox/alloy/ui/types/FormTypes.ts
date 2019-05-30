import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { RawDomSchema, SimpleOrSketchSpec, SketchSpec } from '../../api/component/SpecTypes';
import { CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { ConfiguredPart } from '../../parts/AlloyParts';

export interface FormDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  formBehaviours: SketchBehaviours;
}

export interface FormSpec extends CompositeSketchSpec {
  dom: RawDomSchema;
  formBehaviours?: AlloyBehaviourRecord;
}

export type FormSpecBuilder = (parts: FormParts) => FormSpec;

export interface FormParts {
  field: (name: string, config: SimpleOrSketchSpec) => ConfiguredPart;
  record(): string[];
}

export interface FormSketcher {
  getField: (form: AlloyComponent, key: string) => Option<AlloyComponent>;
  // complex
  sketch: (fSpec: FormSpecBuilder) => SketchSpec;
}