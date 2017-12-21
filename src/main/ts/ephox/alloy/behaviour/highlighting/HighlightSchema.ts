import Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';



export default <any> [
  FieldSchema.strict('highlightClass'),
  FieldSchema.strict('itemClass'),

  Fields.onHandler('onHighlight'),
  Fields.onHandler('onDehighlight')
];