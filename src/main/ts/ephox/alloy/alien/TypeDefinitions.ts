import { FieldProcessorAdt } from '@ephox/boulder';
import { Option } from '@ephox/katamari';
import { isDisabled } from 'ephox/alloy/behaviour/disabling/DisableApis';

// TODO move these to the correct village

export interface SugarElement {
  dom: () => HTMLElement;
}

// Schema
export interface SchemaSchema {
  any;  // todo what is this
}

// Behaviours
export interface AlloyBehaviour {
  config: (spec: any) => any;
  exhibit: (info: any, base: any) => {};
  handlers: (info: any) => {};
  name: () => string;
  revoke: () => { key: string, value: undefined };
  schema: () => SchemaSchema;

  getValue: (any) => any;
  setValue: (...any) => any;
}

export interface AlloyBehaviourConfig {
  fields: FieldProcessorAdt[];
  name: string;
  active?: {};
  apis?: {};
  extra?: {};
  state?: {};
}
