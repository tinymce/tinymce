import { FieldSchema } from '@ephox/boulder';

import * as Fields from '../../data/Fields';

export default [
  // TODO: Work out when we want to  call this. Only when it is has changed?
  Fields.onHandler('onFocus'),
  FieldSchema.defaulted('stopMousedown', false),
  FieldSchema.defaulted('ignore', false)
];