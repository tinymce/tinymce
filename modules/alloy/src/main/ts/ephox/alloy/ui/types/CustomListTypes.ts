import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import type { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

export interface CustomListDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  shell: boolean;
  makeItem: () => AlloySpec;
  listBehaviours: SketchBehaviours;
  setupItem: (list: AlloyComponent, item: AlloyComponent, data: any, index: number) => void;
}

export interface CustomListSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  shell?: boolean;
  makeItem: () => AlloySpec;
  listBehaviours?: AlloyBehaviourRecord;
  setupItem?: (list: AlloyComponent, item: AlloyComponent, data: any, index: number) => void;
}

export interface CustomListApis {
  setItems: (list: AlloyComponent, items: AlloySpec[][]) => void;
}

export interface CustomListSketcher extends CompositeSketch<CustomListSpec>, CustomListApis { }
