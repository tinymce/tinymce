import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';

export default [
  FieldSchema.strict('lazySink'),
  FieldSchema.strict('tooltipDom'),
  FieldSchema.defaulted('exclusive', true),
  FieldSchema.defaulted('tooltipComponents', [ ]),
  FieldSchema.defaulted('delay', 300)
];