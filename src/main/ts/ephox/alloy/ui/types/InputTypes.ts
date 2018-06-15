import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchSpec, SingleSketchDetail } from '../../api/ui/Sketcher';

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

  // FIX: Add the things detail is getting.
}

export interface InputSketcher extends SingleSketch<InputSpec, InputDetail> { }