import Debugging from '../debugging/Debugging';
import MenuMarkers from '../menu/util/MenuMarkers';
import { FieldPresence } from '@ephox/boulder';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Result } from '@ephox/katamari';

var initSize = FieldSchema.strictObjOf('initSize', [
  FieldSchema.strict('numColumns'),
  FieldSchema.strict('numRows')
]);

var itemMarkers = function () {
  return FieldSchema.strictOf('markers', MenuMarkers.itemSchema());
};

var menuMarkers = function () {
  return FieldSchema.strictOf('markers', MenuMarkers.schema());
};

var tieredMenuMarkers = function () {
  return FieldSchema.strictObjOf('markers', [
    FieldSchema.strict('backgroundMenu')
  ].concat(MenuMarkers.menuFields()).concat(MenuMarkers.itemFields()));
};

var markers = function (required) {
  return FieldSchema.strictObjOf('markers', Arr.map(required, FieldSchema.strict));
};

var onPresenceHandler = function (label, fieldName, presence) {
  // We care about where the handler was declared (in terms of which schema)
  var trace = Debugging.getTrace();
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

var onHandler = function (fieldName) {
  return onPresenceHandler('onHandler', fieldName, FieldPresence.defaulted(Fun.noop));
};

var onKeyboardHandler = function (fieldName) {
  return onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.defaulted(Option.none));
};

var onStrictHandler = function (fieldName) {
  return onPresenceHandler('onHandler', fieldName, FieldPresence.strict());
};

var onStrictKeyboardHandler = function (fieldName) {
  return onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.strict());
};

var output = function (name, value) {
  return FieldSchema.state(name, Fun.constant(value));
};

var snapshot = function (name) {
  return FieldSchema.state(name, Fun.identity);
};

export default <any> {
  initSize: Fun.constant(initSize),
  itemMarkers: itemMarkers,
  menuMarkers: menuMarkers,
  tieredMenuMarkers: tieredMenuMarkers,
  markers: markers,

  onHandler: onHandler,
  onKeyboardHandler: onKeyboardHandler,
  onStrictHandler: onStrictHandler,
  onStrictKeyboardHandler: onStrictKeyboardHandler,

  output: output,
  snapshot: snapshot
};