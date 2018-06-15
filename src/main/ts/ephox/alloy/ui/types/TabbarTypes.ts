import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec, LooseSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';

export interface TabbarDetail extends CompositeSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  tabbarBehaviours: () => SketchBehaviours;

  markers: () => {
    selectedClass: () => string;
    tabClass: () => string;
  };

  clickToDismiss: () => boolean;
}

export interface TabbarSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  tabbarBehaviours?: AlloyBehaviourRecord;

  tabs: LooseSpec[];
}

export interface TabbarSketcher extends CompositeSketch<TabbarSpec, TabbarDetail> { }