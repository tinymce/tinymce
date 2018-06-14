import { AlloyBehaviourRecord } from 'ephox/alloy/api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { SketchBehaviours } from 'ephox/alloy/api/component/SketchBehaviours';
import { Option } from '@ephox/katamari';

export interface ButtonDetail {
  uid: () => string;
  // FIX: Completed DOM tpye.
  dom: () => any;
  components: () => AlloySpec[ ];
  buttonBehaviours: () => SketchBehaviours;
  action: () => Option<() => ButtonAction>;
  role: () => Option<string>;
  eventOrder: () => Record<string, string[]>
}

export type ButtonAction = (AlloyComponent) => void;

export interface ButtonSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  buttonBehaviours: AlloyBehaviourRecord;
  action?: ButtonAction;
  role?: string;
  eventOrder?: Record<string, string[]>
}