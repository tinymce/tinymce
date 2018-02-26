import { FieldSchema } from '@ephox/boulder';

import Fields from '../../data/Fields';

export default <any> [
  FieldSchema.strict('highlightClass'),
  FieldSchema.strict('itemClass'),

  Fields.onHandler('onHighlight'),
  Fields.onHandler('onDehighlight')
];