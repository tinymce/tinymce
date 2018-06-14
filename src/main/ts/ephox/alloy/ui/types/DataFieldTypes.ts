import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { RawDomSchema, SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketch } from '../../api/ui/Sketcher';

export interface DataFieldDetail {
  uid: () => string;
  // FIX: Completed DOM tpye.
  dom: () => any;
  dataBehaviours: () => SketchBehaviours;
  getInitialValue: () => () => any;
}

export interface DataFieldSpec {
  uid?: string;
  dom: RawDomSchema;
  getInitialValue: () => any;
  dataBehaviours?: AlloyBehaviourRecord;
}

export interface DataFieldSketcher extends SingleSketch {
  sketch: (spec: DataFieldSpec) => SketchSpec;
}