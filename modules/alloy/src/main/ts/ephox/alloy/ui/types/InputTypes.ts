import { Optional } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { RawDomSchema } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';

// The V is because this is shared with Typeahead.
export interface InputDetail extends SingleSketchDetail {
  uid: string;
  dom: RawDomSchema;
  inputBehaviours: SketchBehaviours;
  inputStyles: { };
  inputClasses: string[];
  inputAttributes: { };
  tag: string;
  data: Optional<string>;
  onSetValue: (comp: AlloyComponent, data: string) => void;
  selectOnFocus: boolean;
  eventOrder: Record<string, string[]>;
}

export interface InputSpec extends SingleSketchSpec {
  uid?: string;
  tag?: string;
  inputClasses?: string[];
  inputAttributes?: { };
  inputStyles?: { };
  inputBehaviours?: AlloyBehaviourRecord;
  data?: string;

  selectOnFocus?: boolean;
  eventOrder?: Record<string, string[]>;
  onSetValue?: (comp: AlloyComponent, data: string) => void;
}

export interface InputSketcher extends SingleSketch<InputSpec> { }
