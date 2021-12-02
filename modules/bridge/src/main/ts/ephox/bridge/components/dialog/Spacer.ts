import { FieldSchema, StructureSchema } from '@ephox/boulder';

export interface SpacerSpec {
  type: 'spacer';
}

export interface Spacer {
  type: 'spacer';
}

export const spacerSchema = StructureSchema.objOf([
  FieldSchema.requiredString('type'),
]);
