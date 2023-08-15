import * as SchemaLookupTable from './SchemaLookupTable';
import { SchemaType } from './SchemaTypes';

const schemaCache: Record<string, SchemaLookupTable.SchemaLookupTable> = {};

export const getLookupTable = (type: SchemaType): SchemaLookupTable.SchemaLookupTable => {
  if (!schemaCache[type]) {
    schemaCache[type] = SchemaLookupTable.makeSchema(type);
  }

  return schemaCache[type];
};

