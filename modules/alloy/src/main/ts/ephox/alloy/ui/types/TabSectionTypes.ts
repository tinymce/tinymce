import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import type { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

import type { TabButtonWithViewSpec } from './TabbarTypes';

export interface TabSectionDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  tabSectionBehaviours: SketchBehaviours;

  // Maybe these are components due to caching.
  tabs: [{ value: string; view: () => AlloySpec[] } ];
  onChangeTab: (component: AlloyComponent, button: AlloyComponent, panel: AlloySpec[]) => void;
  selectFirst: boolean;
  onDismissTab: (component: AlloyComponent, button: AlloyComponent) => void;
}

export interface TabSectionSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  tabSectionBehaviours?: AlloyBehaviourRecord;

  tabs: Array<Partial<TabButtonWithViewSpec>>;
  selectFirst?: boolean;
  onChangeTab?: (component: AlloyComponent, button: AlloyComponent, panel: AlloySpec[]) => void;
  onDismissTab?: (component: AlloyComponent, button: AlloyComponent) => void;
}

export interface TabSectionApis {
  getViewItems: (component: AlloyComponent) => AlloyComponent[];
  showTab: (component: AlloyComponent, tabKey: string) => void;
}

export interface TabSectionSketcher extends CompositeSketch<TabSectionSpec>, TabSectionApis { }
