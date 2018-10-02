import { Result, Fun, Arr } from '@ephox/katamari';
import { FieldSchema, ValueSchema, FieldPresence } from '@ephox/boulder';

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
  'inserttable': {numRows: Number, numColumns: Number};
}

const strictEnum = (key, values) => FieldSchema.field(key, key, FieldPresence.strict(), ValueSchema.valueOf((inValue) => {
    return Arr.contains(values, inValue)
    ? Result.value(inValue)
    : Result.error(`Value was: "${inValue}". Must be one of [${Arr.map(values, (v) => `"${v}"`).join(', ')}]`);
}));

export const fancyMenuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  strictEnum('fancytype', ['inserttable']), // These will need to match the keys of FancyActionArgsMap above
  FieldSchema.defaultedFunction('onAction', Fun.noop)
]);

export const createFancyMenuItem = (spec: FancyMenuItemApi): Result<FancyMenuItem, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw('fancymenuitem', fancyMenuItemSchema, spec);
};