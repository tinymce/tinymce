import { FieldPresence, FieldProcessor, FieldSchema, StructureSchema } from '@ephox/boulder';
import { Arr, Fun, Optional, Result } from '@ephox/katamari';

import * as Debugging from '../debugging/Debugging';
import * as MenuMarkers from '../menu/util/MenuMarkers';

const _initSize: FieldProcessor = FieldSchema.requiredObjOf('initSize', [
  FieldSchema.required('numColumns'),
  FieldSchema.required('numRows')
]);

const itemMarkers: () => FieldProcessor = () => FieldSchema.requiredOf('markers', MenuMarkers.itemSchema());

const menuMarkers: () => FieldProcessor = () => FieldSchema.requiredOf('markers', MenuMarkers.schema());

const tieredMenuMarkers: () => FieldProcessor = () => FieldSchema.requiredObjOf('markers', [
  FieldSchema.required('backgroundMenu')
].concat(MenuMarkers.menuFields()).concat(MenuMarkers.itemFields()));

const markers = (required: string[]): FieldProcessor => FieldSchema.requiredObjOf('markers', Arr.map(required, FieldSchema.required));

const onPresenceHandler = (label: string, fieldName: string, presence: any): FieldProcessor => {
  // We care about where the handler was declared (in terms of which schema)
  const trace = Debugging.getTrace();
  return FieldSchema.field(
    fieldName,
    fieldName,
    presence,
    // Apply some wrapping to their supplied function
    StructureSchema.valueOf((f) => Result.value((...args: any[]) => {
      /*
         * This line is just for debugging information
         */
      Debugging.logHandler(label, fieldName, trace);
      return f.apply(undefined, args);
    }))
  );
};

const onHandler = (fieldName: string): FieldProcessor => onPresenceHandler('onHandler', fieldName, FieldPresence.defaulted(Fun.noop));

const onKeyboardHandler = (fieldName: string): FieldProcessor => onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.defaulted(Optional.none));

const onStrictHandler = (fieldName: string): FieldProcessor => onPresenceHandler('onHandler', fieldName, FieldPresence.required());

const onStrictKeyboardHandler = (fieldName: string): FieldProcessor => onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.required());

const output = (name: string, value: any): FieldProcessor => FieldSchema.customField(name, Fun.constant(value));

const snapshot = (name: string): FieldProcessor => FieldSchema.customField(name, Fun.identity);

const initSize: () => FieldProcessor = Fun.constant(_initSize);

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
