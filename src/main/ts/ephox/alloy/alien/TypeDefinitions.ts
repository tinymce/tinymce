import { FieldProcessorAdt } from '@ephox/boulder';
import { Option } from '@ephox/katamari';
import { isDisabled } from 'ephox/alloy/behaviour/disabling/DisableApis';
import { value } from '@ephox/boulder/lib/main/ts/ephox/boulder/core/ValueProcessor';

// TODO move these to the correct village

export interface SugarElement {
  dom: () => HTMLElement;
}

// Config
export interface RawUserSpec {
  any;
}

// simulatedEvent


// Behaviours
export interface AlloyBehaviour {
  config: (spec: any) => { key: string, value: any };
  exhibit: (info: any, base: any) => {};
  handlers: (info: any) => {};
  name: () => string;
  revoke: () => { key: string, value: undefined };
  schema: () => FieldProcessorAdt;

  getValue: (any) => any;
  setValue: (...any) => any;
  fields?: FieldProcessorAdt[];
}

// WIP
// export interface AlloyBehaviourSchema {
//   config: {};
//   configAsRaw: () => {};
//   initialConfig: any;
//   me: any;
//   state: any;
// }

export interface AlloyBehaviourConfig {
  fields: FieldProcessorAdt[];
  name: string;
  active?: {};
  apis?: {};
  extra?: {};
  state?: {};
}
