import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';
import { DropdownDetail } from 'ephox/alloy/ui/types/DropdownTypes';

export interface SplitDropdownDetail extends DropdownDetail {
  uid: () => string;
  // FIX: Completed DOM tpye.
  dom: () => any;
  components: () => AlloySpec[ ];
  splitDropdownBehaviours: () => SketchBehaviours;
}

export interface SplitDropdownSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  splitDropdownBehaviours?: AlloyBehaviourRecord;
}

export interface SplitDropdownSketcher extends CompositeSketch<SplitDropdownSpec, SplitDropdownDetail> { }