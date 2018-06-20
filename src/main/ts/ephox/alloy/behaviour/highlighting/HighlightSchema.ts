import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';

import * as Fields from '../../data/Fields';

export default [
  FieldSchema.strict('highlightClass'),
  FieldSchema.strict('itemClass'),

  Fields.onHandler('onHighlight'),
  Fields.onHandler('onDehighlight')
];