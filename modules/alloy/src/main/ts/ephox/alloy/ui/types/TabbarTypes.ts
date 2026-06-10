import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import type { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

import type { TabButtonSpec } from './TabButtonTypes';

export interface TabbarDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  tabbarBehaviours: SketchBehaviours;

  markers: {
    selectedClass: string;
    tabClass: string;
  };

  clickToDismiss: boolean;
}

export interface TabButtonWithViewSpec extends TabButtonSpec {
  view: () => AlloySpec[];
}

export interface TabbarSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  tabbarBehaviours?: AlloyBehaviourRecord;

  tabs: Array<Partial<TabButtonWithViewSpec>>;
}

export interface TabbarSketcher extends CompositeSketch<TabbarSpec> { }
