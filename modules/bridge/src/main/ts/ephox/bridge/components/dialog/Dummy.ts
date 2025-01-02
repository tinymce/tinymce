import { StructureSchema } from '@ephox/boulder';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface DummySpec {
  type: 'dummy';
}

export interface Dummy {
  type: 'dummy';
}

export const dummySchema = StructureSchema.objOf([
  ComponentSchema.type,
]);