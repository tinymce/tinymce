import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

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
