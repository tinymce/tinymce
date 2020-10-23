import { FieldSchema, Objects, Processor, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as CommonBehaviour from '../../behaviour/common/Behaviour';
import { NoState, BehaviourState } from '../../behaviour/common/BehaviourState';
import * as BehaviourTypes from '../../behaviour/common/BehaviourTypes';

export type ConfiguredBehaviour<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState = BehaviourState> = BehaviourTypes.ConfiguredBehaviour<C, D, S>;
export type AlloyBehaviourRecord = BehaviourTypes.BehaviourRecord;

export type BehaviourConfigSpec = BehaviourTypes.BehaviourConfigSpec;
export type BehaviourConfigDetail = BehaviourTypes.BehaviourConfigDetail;

export type NamedConfiguredBehaviour<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState = BehaviourState> = BehaviourTypes.NamedConfiguredBehaviour<C, D, S>;
export type AlloyBehaviour<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState = BehaviourState> = BehaviourTypes.AlloyBehaviour<C, D, S>;

export type AlloyBehaviourConfig<D extends BehaviourConfigDetail, S extends BehaviourState, A extends BehaviourTypes.BehaviourApisRecord<D, S>, E extends BehaviourTypes.BehaviourExtraRecord<E> = {}> = BehaviourTypes.BehaviourConfig<D, S, A, E>;
export type BehaviourModeSpec<D extends BehaviourConfigDetail, S extends BehaviourState, A extends BehaviourTypes.BehaviourApisRecord<D, S>, E extends BehaviourTypes.BehaviourExtraRecord<E> = {}> = BehaviourTypes.BehaviourModeSpec<D, S, A, E>;

const derive = (
  capabilities: Array<NamedConfiguredBehaviour<any, any, any>>
): AlloyBehaviourRecord => Objects.wrapAll(capabilities);

const simpleSchema: Processor = ValueSchema.objOfOnly([
  FieldSchema.strict('fields'),
  FieldSchema.strict('name'),
  FieldSchema.defaulted('active', { }),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('state', NoState),
  FieldSchema.defaulted('extra', { })
]);

const create = <
  C extends BehaviourTypes.BehaviourConfigSpec,
  D extends BehaviourTypes.BehaviourConfigDetail,
  S extends BehaviourState,
  A extends BehaviourTypes.BehaviourApisRecord<D, S>,
  E extends BehaviourTypes.BehaviourExtraRecord<E> = {}
>(data: AlloyBehaviourConfig<D, S, A, E>) => {
  const value = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
  return CommonBehaviour.create<C, D, S, A, E>(value.fields, value.name, value.active, value.apis, value.extra, value.state);
};

const modeSchema: Processor = ValueSchema.objOfOnly([
  FieldSchema.strict('branchKey'),
  FieldSchema.strict('branches'),
  FieldSchema.strict('name'),
  FieldSchema.defaulted('active', { }),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('state', NoState),
  FieldSchema.defaulted('extra', { })
]);

const createModes = <
  C extends BehaviourTypes.BehaviourConfigSpec,
  D extends BehaviourTypes.BehaviourConfigDetail,
  S extends BehaviourState,
  A extends BehaviourTypes.BehaviourApisRecord<D, S>,
  E extends BehaviourTypes.BehaviourExtraRecord<E> = {}
>(data: BehaviourModeSpec<D, S, A, E>) => {
  const value = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
  return CommonBehaviour.createModes<C, D, S, A, E>(
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
