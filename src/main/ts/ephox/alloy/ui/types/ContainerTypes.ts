import { AlloyBehaviourRecord } from 'ephox/alloy/api/behaviour/Behaviour';
import { SketchBehaviours } from 'ephox/alloy/api/component/SketchBehaviours';
import { EventHandlerConfigRecord } from 'ephox/alloy/api/events/AlloyEvents';

import { AlloySpec, OptionalDomSchema } from '../../api/component/SpecTypes';

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
  containerBehaviours: AlloyBehaviourRecord;
  events: EventHandlerConfigRecord;
  domModification: any;
  eventOrder: Record<string, string[]>
}