import { FieldSchema, Objects, Processor, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';
import { ComposingCreateConfig } from 'ephox/alloy/api/behaviour/Composing';
import { DockingBehaviour } from 'ephox/alloy/api/behaviour/Docking';

import * as Behaviour from '../../behaviour/common/Behaviour';
import * as NoState from '../../behaviour/common/NoState';

const derive = function (capabilities): {} {
  return Objects.wrapAll(capabilities);
};

const simpleSchema: Processor = ValueSchema.objOfOnly([
  FieldSchema.strict('fields'),
  FieldSchema.strict('name'),
  FieldSchema.defaulted('active', { }),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('extra', { }),
  FieldSchema.defaulted('state', NoState)
]);

const create = function (data: AlloyBehaviourConfig | ComposingCreateConfig | DockingBehaviour): AlloyBehaviour {
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