import Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';



export default <any> [
  // TODO: Work out when we want to  call this. Only when it is has changed?
  Fields.onHandler('onFocus'),
  FieldSchema.defaulted('ignore', false)
];