import { Result, Fun } from '@ephox/katamari';
import { FieldSchema, ValueSchema } from '@ephox/boulder';

export interface FancyMenuItemApi {
  type: 'fancymenuitem';
  fancytype: string;
  onAction: (data: any) => void;
}

export interface FancyMenuItem {
  type: 'fancymenuitem';
  fancytype: keyof FancyActionArgsMap;
  onAction: <K extends keyof FancyActionArgsMap>(data: FancyActionArgsMap[K]) => void;
}

export interface FancyActionArgsMap {
  'inserttable': { numRows: Number; numColumns: Number };
  'colorswatch': { value: string };
}

const fancyTypes: (keyof FancyActionArgsMap)[] = [ 'inserttable', 'colorswatch' ]; // These will need to match the keys of FancyActionArgsMap above

export const fancyMenuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.strictStringEnum('fancytype', fancyTypes),
  FieldSchema.defaultedFunction('onAction', Fun.noop)
]);

export const createFancyMenuItem = (spec: FancyMenuItemApi): Result<FancyMenuItem, ValueSchema.SchemaError<any>> => ValueSchema.asRaw('fancymenuitem', fancyMenuItemSchema, spec);
