import { FieldProcessorAdt } from '@ephox/boulder/lib/main/ts/ephox/boulder/api/DslType';
import { Option } from '@ephox/boulder/node_modules/@ephox/katamari';

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
}

export interface ComposingBehaviour extends AlloyBehaviour {
  config: (Composing) => any;
}

export interface AlloyBehaviourCreateConfig {
  fields: FieldProcessorAdt[];
  name: string;
  active?: {
    exhibit?: (base, info) => any,
    events?: () => {}
  };
  apis?: blah;
  extra?: any;
  state?: any;

}

export interface blah {
  getCurrent: (component, componentConfig, composeState) => any;
}
