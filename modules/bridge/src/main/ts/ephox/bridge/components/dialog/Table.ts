import { Result } from '@ephox/katamari';
import { ValueSchema, FieldSchema } from '@ephox/boulder';

export interface TableSpec {
  type: 'table';
  header: string[];
  cells: string[][];
}

export interface Table {
  type: 'table';
  header: string[];
  cells: string[][];
}

const tableFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictArrayOf('header', ValueSchema.string),
  FieldSchema.strictArrayOf('cells', ValueSchema.arrOf(ValueSchema.string))
];

export const tableSchema = ValueSchema.objOf(tableFields);

export const createTable = (spec: TableSpec): Result<Table, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Table>('table', tableSchema, spec);
