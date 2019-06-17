import { FieldProcessorAdt, FieldSchema, Objects, Processor, ValueSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import * as CommonBehaviour from '../../behaviour/common/Behaviour';
import { NoState, BehaviourState } from '../../behaviour/common/BehaviourState';
import { BehaviourConfigAndState } from '../../behaviour/common/BehaviourBlob';
import { DomModification } from '../../dom/DomModification';
import { DomDefinitionDetail } from '../../dom/DomDefinition';

export type AlloyBehaviourRecord = Record<string, ConfiguredBehaviour<any, any>>;

export interface BehaviourConfigSpec { }
export interface BehaviourConfigDetail { }

export interface NamedConfiguredBehaviour<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail> {
  key: string;
  value: ConfiguredBehaviour<C, D>;
}

export interface AlloyBehaviour<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail> {
  config: (spec: C) => NamedConfiguredBehaviour<C, D>;
  exhibit: (
    info: Record<string, () => Option<BehaviourConfigAndState<any, BehaviourState>>>,
    base: DomDefinitionDetail
  ) => DomModification;
  handlers: (info: D) => {};
  name: () => string;
  revoke: () => { key: string, value: undefined };
  schema: () => FieldProcessorAdt;
}

export interface ConfiguredBehaviour<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail> {
  config: D;
  configAsRaw: () => C;
  initialConfig: {};
  me: AlloyBehaviour<C, D>;
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

const derive = (
  capabilities: Array<NamedConfiguredBehaviour<any, any>>
): AlloyBehaviourRecord => {
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

const create = <C extends BehaviourConfigSpec, D extends BehaviourConfigDetail>(data: AlloyBehaviourConfig): AlloyBehaviour<C, D> => {
  const value = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
  return CommonBehaviour.create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
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

const createModes = <C extends BehaviourConfigSpec, D extends BehaviourConfigDetail>(data: BehaviourModeSpec): AlloyBehaviour<C, D> => {
  const value: BehaviourModeSpec = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
  return CommonBehaviour.createModes(
    ValueSchema.choose(value.branchKey, value.branches),
    value.name, value.active, value.apis, value.extra, value.state
  );
};

const revoke = Fun.constant(undefined);
const noActive = Fun.constant({ });
const noApis = Fun.constant({ });
const noExtra = Fun.constant({ });

export {
  derive,
  revoke,
  noActive,
  noApis,
  noExtra,
  create,
  createModes
};