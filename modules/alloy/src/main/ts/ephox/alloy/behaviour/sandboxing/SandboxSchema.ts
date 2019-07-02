import { FieldSchema } from '@ephox/boulder';

import * as Fields from '../../data/Fields';

export default [
  Fields.onHandler('onOpen'),
  Fields.onHandler('onClose'),

  // Maybe this should be optional
  FieldSchema.strict('isPartOf'),

  FieldSchema.strict('getAttachPoint'),

  FieldSchema.defaulted('cloakVisibilityAttr', 'data-precloak-visibility')
];
