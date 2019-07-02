import { FieldSchema } from '@ephox/boulder';
import { Option } from '@ephox/katamari';

import * as Fields from '../../data/Fields';

export default [
  FieldSchema.strict('invalidClass'),
  FieldSchema.defaulted('getRoot', Option.none),

  // TODO: Completely rework the notify API
  FieldSchema.optionObjOf('notify', [
    FieldSchema.defaulted('aria', 'alert'),
    // Maybe we should use something else.
    FieldSchema.defaulted('getContainer', Option.none),
    FieldSchema.defaulted('validHtml', ''),
    Fields.onHandler('onValid'),
    Fields.onHandler('onInvalid'),
    Fields.onHandler('onValidate')
  ]),

  FieldSchema.optionObjOf('validator', [
    FieldSchema.strict('validate'),
    FieldSchema.defaulted('onEvent', 'input'),
    FieldSchema.defaulted('validateOnLoad', true)
  ])
];
