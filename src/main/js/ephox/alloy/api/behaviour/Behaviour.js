import Behaviour from '../../behaviour/common/Behaviour';
import NoState from '../../behaviour/common/NoState';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var derive = function (capabilities) {
  return Objects.wrapAll(capabilities);
};

var simpleSchema = ValueSchema.objOfOnly([
  FieldSchema.strict('fields'),
  FieldSchema.strict('name'),
  FieldSchema.defaulted('active', { }),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('extra', { }),
  FieldSchema.defaulted('state', NoState)
]);

var create = function (data) {
  var value = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
  return Behaviour.create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
};

var modeSchema = ValueSchema.objOfOnly([
  FieldSchema.strict('branchKey'),
  FieldSchema.strict('branches'),
  FieldSchema.strict('name'),
  FieldSchema.defaulted('active', { }),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('extra', { }),
  FieldSchema.defaulted('state', NoState)
]);

var createModes = function (data) {
  var value = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
  return Behaviour.createModes(
    ValueSchema.choose(value.branchKey, value.branches),
    value.name, value.active, value.apis, value.extra, value.state
  );
};

export default <any> {
  derive: derive,
  revoke: Fun.constant(undefined),
  noActive: Fun.constant({ }),
  noApis: Fun.constant({ }),
  noExtra: Fun.constant({ }),
  noState: Fun.constant(NoState),
  create: create,
  createModes: createModes
};