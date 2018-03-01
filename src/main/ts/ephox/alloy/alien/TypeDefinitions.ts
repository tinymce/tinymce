import { FieldProcessorAdt } from '@ephox/boulder/lib/main/ts/ephox/boulder/api/DslType';
import { Option } from '@ephox/boulder/node_modules/@ephox/katamari';
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

export interface ComposingApi {
  // TODO: this is defined by Composing, how to move this into Composing, and overried AlloyBehaviourConfig from Behaviour.create()
  getCurrent: (component, componentConfig, composeState) => any;
}

export interface DisablingApi {
  // TODO: this is defined by DisablingApi, how to move this into Composing, and overried AlloyBehaviourConfig from Behaviour.create()
  enable: (component, disableConfig, disableState) => void;
  disable: (component, disableConfig, disableState) => void;
  isDisabled: (component) => boolean;
  onLoad: (component, disableConfig, disableState) => void;
}
