import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { LooseSpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { ConfiguredPart } from '../../parts/AlloyParts';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';

export interface FormSpec extends CompositeSketchSpec {
  dom: RawDomSchema;
  formBehaviours?: AlloyBehaviourRecord;
}

export interface FormDetail extends CompositeSketchDetail {
  uid: () => string;
  // FIX: Completed DOM tpye.
  dom: () => any;
  formBehaviours: () => SketchBehaviours;
}

export type FormSpecBuilder = (FormParts) => FormSpec;

export interface FormParts {
  field: (name: string, config: LooseSpec) => ConfiguredPart;
  record(): string[];
}

export interface FormSketcher {
  getField: (form: AlloyComponent, key: string) => Option<AlloyComponent>;
  //complex
  sketch: (fSpec: FormSpecBuilder) => any;
}