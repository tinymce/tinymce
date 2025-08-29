import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { RawDomSchema } from '../../api/component/SpecTypes';
import type { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';

export interface DataFieldDetail extends SingleSketchDetail {
  uid: string;
  dom: RawDomSchema;
  dataBehaviours: SketchBehaviours;
  getInitialValue: () => any;
}

export interface DataFieldSpec extends SingleSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  getInitialValue: () => any;
  dataBehaviours?: AlloyBehaviourRecord;
}

export interface DataFieldSketcher extends SingleSketch<DataFieldSpec> { }
