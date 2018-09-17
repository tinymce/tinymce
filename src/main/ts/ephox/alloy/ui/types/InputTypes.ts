import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { RawDomSchema } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';

// The V is because this is shared with Typeahead.
export interface InputDetail extends SingleSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  inputBehaviours: () => SketchBehaviours;

  placeholder: () => Option<string>;
  inputStyles: () => { };
  inputClasses: () => string[];
  inputAttributes: () => { };
  type: () => string;
  tag: () => string;
  data: () => Option<string>;
  onSetValue: () => (comp: AlloyComponent, data: string) => void;
  selectOnFocus: () => boolean;
  eventOrder: () => Record<string, string[]>;
}

export interface InputSpec extends SingleSketchSpec {
  uid?: string;
  tag?: string;
  inputClasses?: string[];
  inputAttributes?: { };
  inputStyles?: { };
  inputBehaviours?: AlloyBehaviourRecord;
  placeholder?: string;
  data?: string;
  type?: string;

  selectOnFocus?: boolean;
  eventOrder?: Record<string, string[]>;
  onSetValue?: (comp: AlloyComponent, data: string) => void;
}

export interface InputSketcher extends SingleSketch<InputSpec, InputDetail> { }