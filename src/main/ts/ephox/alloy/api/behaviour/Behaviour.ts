import { FieldProcessorAdt, FieldSchema, Objects, Processor, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as Behaviour from '../../behaviour/common/Behaviour';
import { NoState } from 'ephox/alloy/behaviour/common/BehaviourState';

export type AlloyBehaviourRecord = Record<string, ConfiguredBehaviour>;

export interface NamedConfiguredBehaviour {
  key: string;
  value: ConfiguredBehaviour;
}

export interface AlloyBehaviour {
  config: (spec: any) => NamedConfiguredBehaviour;
  exhibit: (info: any, base: any) => {};
  handlers: (info: any) => {};
  name: () => string;
  revoke: () => { key: string, value: undefined };
  schema: () => FieldProcessorAdt;
}

export interface ConfiguredBehaviour {
  config: { [key: string]: () => any};
  configAsRaw: () => Record<string, any>;
  initialConfig: {};
  me: AlloyBehaviour;
  state: any;
}

export interface AlloyBehaviourConfig {
  fields: FieldProcessorAdt[];
  name: string;
  active?: {};
  apis?: {};
  extra?: {};
  state?: {};
}

const derive = (capabilities): AlloyBehaviourRecord => {
  return Objects.wrapAll(capabilities);
};

const simpleSchema: Processor = ValueSchema.objOfOnly([
  FieldSchema.strict('fields'),
  FieldSchema.strict('name'),
  FieldSchema.defaulted('active', { }),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('state', NoState),
  FieldSchema.defaulted('extra', { })
]);

const create = (data: AlloyBehaviourConfig): AlloyBehaviour => {
  const value = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
  return Behaviour.create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
};

export interface BehaviourModeSpec {
  branchKey: string;
  branches: Record<string, FieldProcessorAdt[]>;
  name: string;
  active?: any;
  apis?: { };
  extra?: { };
  state?: { };
}

const modeSchema: Processor = ValueSchema.objOfOnly([
  FieldSchema.strict('branchKey'),
  FieldSchema.strict('branches'),
  FieldSchema.strict('name'),
  FieldSchema.defaulted('active', { }),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('state', NoState),
  FieldSchema.defaulted('extra', { })
]);

const createModes = (data: BehaviourModeSpec): AlloyBehaviour => {
  const value: BehaviourModeSpec = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
  return Behaviour.createModes(
    ValueSchema.choose(value.branchKey, value.branches),
    value.name, value.active, value.apis, value.extra, value.state
  );
};

const revoke = Fun.constant(undefined) as () => undefined;
const noActive = Fun.constant({ }) as () => {};
const noApis = Fun.constant({ }) as () => {};
const noExtra = Fun.constant({ }) as () => {};

export {
  derive,
  revoke,
  noActive,
  noApis,
  noExtra,
  create,
  createModes
};