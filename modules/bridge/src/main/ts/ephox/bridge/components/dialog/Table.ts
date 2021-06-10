import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

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
  FieldSchema.requiredString('type'),
  FieldSchema.requiredArrayOf('header', ValueSchema.string),
  FieldSchema.requiredArrayOf('cells', ValueSchema.arrOf(ValueSchema.string))
];

export const tableSchema = ValueSchema.objOf(tableFields);

export const createTable = (spec: TableSpec): Result<Table, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Table>('table', tableSchema, spec);
