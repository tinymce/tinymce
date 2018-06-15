import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';

export interface ToolbarGroupDetail extends CompositeSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  tgroupBehaviours: () => SketchBehaviours;

  markers: () => {
    itemClass: () => string;
  };
  items: () => AlloySpec[];
}

export interface ToolbarGroupSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  tgroupBehaviours?: AlloyBehaviourRecord;

  items: AlloySpec[]
  markers: {
    itemClass: string;
  }
}

export interface ToolbarGroupSketcher extends CompositeSketch<ToolbarGroupSpec, ToolbarGroupDetail> { }