import { FieldPresence, StructureProcessor, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Optional, Result } from '@ephox/katamari';

import * as Debugging from '../debugging/Debugging';
import * as MenuMarkers from '../menu/util/MenuMarkers';

const _initSize: StructureProcessor = FieldSchema.requiredObjOf('initSize', [
  FieldSchema.required('numColumns'),
  FieldSchema.required('numRows')
]);

const itemMarkers: () => StructureProcessor = () => FieldSchema.requiredOf('markers', MenuMarkers.itemSchema());

const menuMarkers: () => StructureProcessor = () => FieldSchema.requiredOf('markers', MenuMarkers.schema());

const tieredMenuMarkers: () => StructureProcessor = () => FieldSchema.requiredObjOf('markers', [
  FieldSchema.required('backgroundMenu')
].concat(MenuMarkers.menuFields()).concat(MenuMarkers.itemFields()));

const markers = (required: string[]): StructureProcessor => FieldSchema.requiredObjOf('markers', Arr.map(required, FieldSchema.required));

const onPresenceHandler = (label: string, fieldName: string, presence: any): StructureProcessor => {
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

const onHandler = (fieldName: string): StructureProcessor => onPresenceHandler('onHandler', fieldName, FieldPresence.defaulted(Fun.noop));

const onKeyboardHandler = (fieldName: string): StructureProcessor => onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.defaulted(Optional.none));

const onStrictHandler = (fieldName: string): StructureProcessor => onPresenceHandler('onHandler', fieldName, FieldPresence.strict());

const onStrictKeyboardHandler = (fieldName: string): StructureProcessor => onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.strict());

const output = (name: string, value: any): StructureProcessor => FieldSchema.state(name, Fun.constant(value));

const snapshot = (name: string): StructureProcessor => FieldSchema.state(name, Fun.identity);

const initSize: () => StructureProcessor = Fun.constant(_initSize);

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
