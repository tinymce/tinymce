import { FieldSchema, Objects, DslType, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { ComposingCreateConfig } from '../../api/behaviour/Composing';
import { DockingBehaviour } from '../../api/behaviour/Docking';

import * as Behaviour from '../../behaviour/common/Behaviour';
import * as NoState from '../../behaviour/common/NoState';

export interface AlloyBehaviour {
  config: (spec: any) => { [key: string]: (any) => any };
  exhibit: (info: any, base: any) => {};
  handlers: (info: any) => {};
  name: () => string;
  revoke: () => { key: string, value: undefined };
  schema: () => DslType.FieldProcessorAdt;

  getValue: (any) => any;
  setValue: (...any) => any;
  fields?: DslType.FieldProcessorAdt[];
}

export interface AlloyBehaviourSchema {
  config: { [key: string]: () => any};
  configAsRaw: () => Record<string, any>;
  initialConfig: {};
  me: AlloyBehaviour;
  state: any;
}

export interface AlloyBehaviourConfig {
  fields: DslType.FieldProcessorAdt[];
  name: string;
  active?: {};
  apis?: {};
  extra?: {};
  state?: {};
}

const derive = function (capabilities): {} {
  return Objects.wrapAll(capabilities);
};

const simpleSchema: DslType.Processor = ValueSchema.objOfOnly([
  FieldSchema.strict('fields'),
  FieldSchema.strict('name'),
  FieldSchema.defaulted('active', { }),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('extra', { }),
  FieldSchema.defaulted('state', NoState)
]);

const create = function (data: AlloyBehaviourConfig): AlloyBehaviour {
  const value = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
  return Behaviour.create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
};

const modeSchema: DslType.Processor = ValueSchema.objOfOnly([
  FieldSchema.strict('branchKey'),
  FieldSchema.strict('branches'),
  FieldSchema.strict('name'),
  FieldSchema.defaulted('active', { }),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('extra', { }),
  FieldSchema.defaulted('state', NoState)
]);

const createModes = function (data) {
  const value = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
  return Behaviour.createModes(
    ValueSchema.choose(value.branchKey, value.branches),
    value.name, value.active, value.apis, value.extra, value.state
  );
};

const revoke = Fun.constant(undefined) as () => undefined;
const noActive = Fun.constant({ }) as () => {};
const noApis = Fun.constant({ }) as () => {};
const noExtra = Fun.constant({ }) as () => {};
const noState = Fun.constant(NoState) as () => {};

export {
  derive,
  revoke,
  noActive,
  noApis,
  noExtra,
  noState,
  create,
  createModes
};