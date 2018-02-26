import { FieldPresence, FieldSchema, ValueSchema, DslType } from '@ephox/boulder';
import { Arr, Fun, Option, Result } from '@ephox/katamari';

import * as Debugging from '../debugging/Debugging';
import MenuMarkers from '../menu/util/MenuMarkers';

const _initSize = FieldSchema.strictObjOf('initSize', [
  FieldSchema.strict('numColumns'),
  FieldSchema.strict('numRows')
]);

const itemMarkers = function () {
  return FieldSchema.strictOf('markers', MenuMarkers.itemSchema());
};

const menuMarkers = function () {
  return FieldSchema.strictOf('markers', MenuMarkers.schema());
};

const tieredMenuMarkers = function () {
  return FieldSchema.strictObjOf('markers', [
    FieldSchema.strict('backgroundMenu')
  ].concat(MenuMarkers.menuFields()).concat(MenuMarkers.itemFields()));
};

const markers = function (required) {
  return FieldSchema.strictObjOf('markers', Arr.map(required, FieldSchema.strict));
};

const onPresenceHandler = function (label, fieldName, presence) {
  // We care about where the handler was declared (in terms of which schema)
  const trace = Debugging.getTrace();
  return FieldSchema.field(
    fieldName,
    fieldName,
    presence,
    // Apply some wrapping to their supplied function
    ValueSchema.valueOf(function (f) {
      return Result.value(function () {
        /*
         * This line is just for debugging information
         */
        Debugging.logHandler(label, fieldName, trace);
        return f.apply(undefined, arguments);
      });
    })
  );
};

const onHandler = function (fieldName) {
  return onPresenceHandler('onHandler', fieldName, FieldPresence.defaulted(Fun.noop));
};

const onKeyboardHandler = function (fieldName) {
  return onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.defaulted(Option.none));
};

const onStrictHandler = function (fieldName) {
  return onPresenceHandler('onHandler', fieldName, FieldPresence.strict());
};

const onStrictKeyboardHandler = function (fieldName) {
  return onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.strict());
};

const output = function (name, value) {
  return FieldSchema.state(name, Fun.constant(value));
};

const snapshot = function (name) {
  return FieldSchema.state(name, Fun.identity);
};

const initSize = Fun.constant(_initSize);

export {
  initSize,
  itemMarkers,
  menuMarkers,
  tieredMenuMarkers,
  markers,

  onHandler,
  onKeyboardHandler,
  onStrictHandler,
  onStrictKeyboardHandler,

  output,
  snapshot
};