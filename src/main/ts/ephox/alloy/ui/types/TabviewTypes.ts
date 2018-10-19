import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { RawDomSchema } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';

export interface TabviewDetail extends SingleSketchDetail {
  uid: string;
  dom: RawDomSchema;
  tabviewBehaviours: SketchBehaviours;
}

export interface TabviewSpec extends SingleSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  tabviewBehaviours?: AlloyBehaviourRecord;
}

export interface TabviewSketcher extends SingleSketch<TabviewSpec, TabviewDetail> { }