import { FieldSchema } from '@ephox/boulder';

import Fields from '../../data/Fields';

export default <any> [
  // TODO: Work out when we want to  call this. Only when it is has changed?
  Fields.onHandler('onFocus'),
  FieldSchema.defaulted('ignore', false)
];