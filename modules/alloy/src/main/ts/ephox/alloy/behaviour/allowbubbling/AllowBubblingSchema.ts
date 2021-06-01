import { ValueProcessorTypes, FieldSchema, ValueSchema } from '@ephox/boulder';

export default [
  FieldSchema.strictArrayOf('events', ValueSchema.objOf([
    FieldSchema.strictString('native'),
    FieldSchema.strictString('simulated')
  ]))
] as ValueProcessorTypes[];