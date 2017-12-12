import EditableFields from '../alien/EditableFields';
import Keys from '../alien/Keys';
import NoState from '../behaviour/common/NoState';
import KeyingType from './KeyingType';
import KeyingTypes from './KeyingTypes';
import KeyMatch from '../navigation/KeyMatch';
import KeyRules from '../navigation/KeyRules';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var schema = [
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  FieldSchema.defaulted('useSpace', false),
  FieldSchema.defaulted('useEnter', true),
  FieldSchema.defaulted('useControlEnter', false),
  FieldSchema.defaulted('useDown', false)
];

var execute = function (component, simulatedEvent, executeConfig, executeState) {
  return executeConfig.execute()(component, simulatedEvent, component.element());
};

var getRules = function (component, simulatedEvent, executeConfig, executeState) {
  var spaceExec = executeConfig.useSpace() && !EditableFields.inside(component.element()) ? Keys.SPACE() : [ ];
  var enterExec = executeConfig.useEnter() ? Keys.ENTER() : [ ];
  var downExec = executeConfig.useDown() ? Keys.DOWN() : [ ];
  var execKeys = spaceExec.concat(enterExec).concat(downExec);

  return [
    KeyRules.rule(KeyMatch.inSet(execKeys), execute)
  ].concat(executeConfig.useControlEnter() ? [
    KeyRules.rule(KeyMatch.and([ KeyMatch.isControl, KeyMatch.inSet(Keys.ENTER()) ]), execute)
  ] : [ ]);
};

var getEvents = Fun.constant({ });
var getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.none());