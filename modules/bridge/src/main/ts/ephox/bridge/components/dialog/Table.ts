import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

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
  ComponentSchema.type,
  FieldSchema.requiredArrayOf('header', ValueType.string),
  FieldSchema.requiredArrayOf('cells', StructureSchema.arrOf(ValueType.string))
];

export const tableSchema = StructureSchema.objOf(tableFields);

export const createTable = (spec: TableSpec): Result<Table, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Table>('table', tableSchema, spec);
