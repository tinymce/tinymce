import { FieldPresence, FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Option, Result } from '@ephox/katamari';

import * as Debugging from '../debugging/Debugging';
import * as MenuMarkers from '../menu/util/MenuMarkers';

const _initSize: FieldProcessorAdt = FieldSchema.strictObjOf('initSize', [
  FieldSchema.strict('numColumns'),
  FieldSchema.strict('numRows')
]);

const itemMarkers: () => FieldProcessorAdt = () => FieldSchema.strictOf('markers', MenuMarkers.itemSchema());

const menuMarkers: () => FieldProcessorAdt = () => FieldSchema.strictOf('markers', MenuMarkers.schema());

const tieredMenuMarkers: () => FieldProcessorAdt = () => FieldSchema.strictObjOf('markers', [
  FieldSchema.strict('backgroundMenu')
].concat(MenuMarkers.menuFields()).concat(MenuMarkers.itemFields()));

const markers = (required: string[]): FieldProcessorAdt => FieldSchema.strictObjOf('markers', Arr.map(required, FieldSchema.strict));

const onPresenceHandler = (label: string, fieldName: string, presence: any): FieldProcessorAdt => {
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

const onHandler = (fieldName: string): FieldProcessorAdt => onPresenceHandler('onHandler', fieldName, FieldPresence.defaulted(Fun.noop));

const onKeyboardHandler = (fieldName: string): FieldProcessorAdt => onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.defaulted(Option.none));

const onStrictHandler = (fieldName: string): FieldProcessorAdt => onPresenceHandler('onHandler', fieldName, FieldPresence.strict());

const onStrictKeyboardHandler = (fieldName: string): FieldProcessorAdt => onPresenceHandler('onKeyboardHandler', fieldName, FieldPresence.strict());

const output = (name: string, value: any): FieldProcessorAdt => FieldSchema.state(name, Fun.constant(value));

const snapshot = (name: string): FieldProcessorAdt => FieldSchema.state(name, Fun.identity);

const initSize: () => FieldProcessorAdt = Fun.constant(_initSize);

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