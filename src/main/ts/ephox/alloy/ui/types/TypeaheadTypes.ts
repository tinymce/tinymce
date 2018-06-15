import { Option, Cell } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';
import { DropdownDetail } from 'ephox/alloy/ui/types/DropdownTypes';
import { InputDetail } from 'ephox/alloy/ui/types/InputTypes';

export interface TypeaheadDetail extends DropdownDetail, InputDetail {
  uid: () => string;
  // FIX: Completed DOM tpye.
  dom: () => any;
  components: () => AlloySpec[ ];
  typeaheadBehaviours: () => SketchBehaviours;

  dismissOnBlur: () => boolean;

  markers: () => {
    openClass: () => string;
  };

  previewing: () => Cell<boolean>;
  minChars: () => number;
}

export interface TypeaheadSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  typeaheadBehaviours?: AlloyBehaviourRecord;
}

export interface TypeaheadSketcher extends CompositeSketch<TypeaheadSpec, TypeaheadDetail> { }