import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';

export interface TabSectionDetail extends CompositeSketchDetail {
  uid: () => string;
  // FIX: Completed DOM tpye.
  dom: () => any;
  components: () => AlloySpec[ ];
  tabSectionBehaviours: () => SketchBehaviours;

  // Maybe these are components due to caching.
  tabs: () => [{ value: string; view: () => AlloySpec[] } ];
  onChangeTab: () => (component: AlloyComponent, button: AlloyComponent, panel: AlloySpec[]) => void;
  selectFirst: () => boolean;
  onDismissTab: () => (component: AlloyComponent, button: AlloyComponent) => void;
}

export interface TabSectionSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  tabSectionBehaviours?: AlloyBehaviourRecord;
}

export interface TabSectionSketcher extends CompositeSketch<TabSectionSpec, TabSectionDetail> {
  getViewItems: (component: AlloyComponent) => AlloyComponent[];
}