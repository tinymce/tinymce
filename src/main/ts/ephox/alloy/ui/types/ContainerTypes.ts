import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, OptionalDomSchema, RawDomSchema } from '../../api/component/SpecTypes';
import { AlloyEventRecord } from '../../api/events/AlloyEvents';
import { SingleSketch } from '../../api/ui/Sketcher';


export interface ContainerDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  containerBehaviours: () => SketchBehaviours;
  // DEPRECATE:
  events: () => AlloyEventRecord;
  // FIX: types
  domModification: () => any;
  eventOrder: () => Record<string, string[]>
}

export interface ContainerSpec {
  uid?: string;
  dom?: OptionalDomSchema;
  components?: AlloySpec[];
  containerBehaviours?: AlloyBehaviourRecord;
  events?: AlloyEventRecord;
  domModification?: any;
  eventOrder?: Record<string, string[]>
}

export interface ContainerSketcher extends SingleSketch<ContainerSpec, ContainerDetail> { };