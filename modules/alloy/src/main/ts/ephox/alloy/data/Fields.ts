import { FieldPresence, ValueProcessorTypes, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Optional, Result } from '@ephox/katamari';

import * as Debugging from '../debugging/Debugging';
import * as MenuMarkers from '../menu/util/MenuMarkers';

const _initSize: ValueProcessorTypes = FieldSchema.strictObjOf('initSize', [
  FieldSchema.strict('numColumns'),
  FieldSchema.strict('numRows')
]);

const itemMarkers: () => ValueProcessorTypes = () => FieldSchema.strictOf('markers', MenuMarkers.itemSchema());

const menuMarkers: () => ValueProcessorTypes = () => FieldSchema.strictOf('markers', MenuMarkers.schema());

const tieredMenuMarkers: () => ValueProcessorTypes = () => FieldSchema.strictObjOf('markers', [
  FieldSchema.strict('backgroundMenu')
].concat(MenuMarkers.menuFields()).concat(MenuMarkers.itemFields()));

const markers = (required: string[]): ValueProcessorTypes => FieldSchema.strictObjOf('markers', Arr.map(required, FieldSchema.strict));

const onPresenceHandler = (label: string, fieldName: string, presence: any): ValueProcessorTypes => {
  // We care about where the handler was declared (in terms of which schema)
  const trace = Debugging.getTrace();
  return FieldSchema.field(
    fieldName,
    fieldName,
    presence,
    // Apply some wrapping to their supplied function
    ValueSchema.valueOf((f) => Result.value((...args: any[]) => {
      /*
         * This line is just for debugging information
         */
      Debugging.logHandler(label, fieldName, trace);
      return f.apply(undefined, args);
    }))
  );
};

const onHandler = (fieldName: string): ValueProcessorTypes => onPresenceHandler('onHandler', fieldName, FieldPresence.defaulted(Fun.noop));

const onKeyboardHandler = (fieldName: string): ValueProcessorTypes => onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.defaulted(Optional.none));

const onStrictHandler = (fieldName: string): ValueProcessorTypes => onPresenceHandler('onHandler', fieldName, FieldPresence.strict());

const onStrictKeyboardHandler = (fieldName: string): ValueProcessorTypes => onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.strict());

const output = (name: string, value: any): ValueProcessorTypes => FieldSchema.state(name, Fun.constant(value));

const snapshot = (name: string): ValueProcessorTypes => FieldSchema.state(name, Fun.identity);

const initSize: () => ValueProcessorTypes = Fun.constant(_initSize);

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
