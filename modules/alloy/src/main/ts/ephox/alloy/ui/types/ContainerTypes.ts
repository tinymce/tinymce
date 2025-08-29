import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, OptionalDomSchema } from '../../api/component/SpecTypes';
import type { AlloyEventRecord } from '../../api/events/AlloyEvents';
import type { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';
import type { DomModification, DomModificationSpec } from '../../dom/DomModification';

export interface ContainerDetail extends SingleSketchDetail {
  uid: string;
  dom: OptionalDomSchema;
  components: AlloySpec[ ];
  containerBehaviours: SketchBehaviours;
  // DEPRECATE:
  events: AlloyEventRecord;
  domModification: DomModification;
  eventOrder: Record<string, string[]>;
}

export interface ContainerSpec extends SingleSketchSpec {
  uid?: string;
  dom?: OptionalDomSchema;
  components?: AlloySpec[];
  containerBehaviours?: AlloyBehaviourRecord;
  events?: AlloyEventRecord;
  domModification?: DomModificationSpec;
  eventOrder?: Record<string, string[]>;
}

export interface ContainerSketcher extends SingleSketch<ContainerSpec> { }
