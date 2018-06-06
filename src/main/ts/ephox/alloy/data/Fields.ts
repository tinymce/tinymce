import { FieldPresence, FieldSchema, ValueSchema, DslType } from '@ephox/boulder';
import { FieldProcessorAdt } from '@ephox/boulder';
import { Arr, Fun, Option, Result } from '@ephox/katamari';

import * as Debugging from '../debugging/Debugging';
import * as MenuMarkers from '../menu/util/MenuMarkers';

const _initSize: DslType.FieldProcessorAdt = FieldSchema.strictObjOf('initSize', [
  FieldSchema.strict('numColumns'),
  FieldSchema.strict('numRows')
]);

const itemMarkers: () => DslType.FieldProcessorAdt = function () {
  return FieldSchema.strictOf('markers', MenuMarkers.itemSchema());
};

const menuMarkers: () => DslType.FieldProcessorAdt = function () {
  return FieldSchema.strictOf('markers', MenuMarkers.schema());
};

const tieredMenuMarkers: () => DslType.FieldProcessorAdt = function () {
  return FieldSchema.strictObjOf('markers', [
    FieldSchema.strict('backgroundMenu')
  ].concat(MenuMarkers.menuFields()).concat(MenuMarkers.itemFields()));
};

const markers = (required: string[]): DslType.FieldProcessorAdt => {
  return FieldSchema.strictObjOf('markers', Arr.map(required, FieldSchema.strict));
};

const onPresenceHandler = (label: string, fieldName: string, presence: any): DslType.FieldProcessorAdt => {
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

const onHandler = (fieldName: string): DslType.FieldProcessorAdt => {
  return onPresenceHandler('onHandler', fieldName, FieldPresence.defaulted(Fun.noop));
};

const onKeyboardHandler = (fieldName: string): DslType.FieldProcessorAdt => {
  return onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.defaulted(Option.none));
};

const onStrictHandler = (fieldName: string): DslType.FieldProcessorAdt =>  {
  return onPresenceHandler('onHandler', fieldName, FieldPresence.strict());
};

const onStrictKeyboardHandler = (fieldName: string): DslType.FieldProcessorAdt =>  {
  return onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.strict());
};

const output = (name: string, value: any): DslType.FieldProcessorAdt => {
  return FieldSchema.state(name, Fun.constant(value));
};

const snapshot = (name: string): DslType.FieldProcessorAdt => {
  return FieldSchema.state(name, Fun.identity);
};

const initSize: () => DslType.FieldProcessorAdt = Fun.constant(_initSize);

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