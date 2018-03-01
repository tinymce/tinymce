import { FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as Behaviour from '../../behaviour/common/Behaviour';
import * as NoState from '../../behaviour/common/NoState';
import { Processor } from '../../../../../../../../boulder/lib/main/ts/ephox/boulder/core/ValueProcessor';
import { AlloyBehaviour, AlloyBehaviourCreateConfig } from 'ephox/alloy/alien/TypeDefinitions';

const derive = function (capabilities): {} {
  return Objects.wrapAll(capabilities);
};

const simpleSchema = ValueSchema.objOfOnly([
  FieldSchema.strict('fields'),
  FieldSchema.strict('name'),
  FieldSchema.defaulted('active', { }),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('extra', { }),
  FieldSchema.defaulted('state', NoState)
]);

const create = function (data: AlloyBehaviourCreateConfig): AlloyBehaviour {
  const value = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
  return Behaviour.create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
};

const modeSchema: Processor = ValueSchema.objOfOnly([
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

const revoke: () => undefined = Fun.constant(undefined);
const noActive: () => {} = Fun.constant({ });
const noApis: () => {} = Fun.constant({ });
const noExtra: () => {} = Fun.constant({ });
const noState: () => {} = Fun.constant(NoState);

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