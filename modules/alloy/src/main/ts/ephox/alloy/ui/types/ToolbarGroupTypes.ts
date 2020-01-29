import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

export interface ToolbarGroupDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  tgroupBehaviours: SketchBehaviours;

  markers: {
    itemSelector: string;
  };
  items: AlloySpec[];
}

export interface ToolbarGroupSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  tgroupBehaviours?: AlloyBehaviourRecord;
  items: AlloySpec[];
  markers: {
    itemSelector: string;
  };
}

export interface ToolbarGroupSketcher extends CompositeSketch<ToolbarGroupSpec> { }
