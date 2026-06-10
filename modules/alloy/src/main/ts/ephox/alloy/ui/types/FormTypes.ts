import type { Optional } from '@ephox/katamari';

import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { RawDomSchema, SimpleOrSketchSpec, SketchSpec } from '../../api/component/SpecTypes';
import type { CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import type { ConfiguredPart } from '../../parts/AlloyParts';

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

export interface FormApis {
  getField: (form: AlloyComponent, key: string) => Optional<AlloyComponent>;
}

export interface FormSketcher extends FormApis {
  // complex
  sketch: (fSpec: FormSpecBuilder) => SketchSpec;
}
