import { ValueSchema, FieldSchema, FieldPresence } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { BodyComponentApi, BodyComponent } from './BodyComponent';
import { itemSchema } from './ItemSchema';

export interface GridApi {
  type: 'grid';
  columns: number;
  items: BodyComponentApi[];
}

export interface Grid {
  type: 'grid';
  columns: number;
  items: BodyComponent[];
}

export const gridFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictNumber('columns'),
  FieldSchema.field(
    'items',
    'items',
    FieldPresence.strict(),
    ValueSchema.arrOf(ValueSchema.valueOf((v) => {
      return ValueSchema.asRaw('Checking item of grid', itemSchema, v).fold(
        (sErr) => Result.error(ValueSchema.formatError(sErr)),
        (passValue) => Result.value(passValue)
      );
    }))
  )
];

export const gridSchema = ValueSchema.objOf(gridFields);

export const createGrid = (spec: GridApi): Result<Grid, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<Grid>('grid', gridSchema, spec);
};
