import { FieldProcessor, FieldSchema, ValueSchema } from '@ephox/boulder';

export default [
  FieldSchema.requiredArrayOf('events', ValueSchema.objOf([
    FieldSchema.requiredString('native'),
    FieldSchema.requiredString('simulated')
  ]))
] as FieldProcessor[];