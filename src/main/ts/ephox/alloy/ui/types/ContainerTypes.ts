
import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec, OptionalDomSchema } from '../../api/component/SpecTypes';
import { SingleSketch } from '../../api/ui/Sketcher';
import { EventHandlerConfigRecord } from '../../api/events/AlloyEvents';

export interface ContainerDetail {
  uid: () => string;
  // FIX: Completed DOM tpye.
  dom: () => any;
  components: () => AlloySpec[ ];
  containerBehaviours: () => SketchBehaviours;
  // DEPRECATE:
  events: () => EventHandlerConfigRecord;
  // FIX: types
  domModification: () => any;
  eventOrder: () => Record<string, string[]>
}

export interface ContainerSpec {
  uid?: string;
  dom?: OptionalDomSchema;
  components?: AlloySpec[];
  containerBehaviours?: AlloyBehaviourRecord;
  events?: EventHandlerConfigRecord;
  domModification?: any;
  eventOrder?: Record<string, string[]>
}

export interface ContainerSketcher extends SingleSketch {
  sketch: (spec: ContainerSpec) => SketchSpec;
}