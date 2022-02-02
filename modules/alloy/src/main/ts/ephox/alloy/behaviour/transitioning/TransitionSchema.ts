import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as Fields from '../../data/Fields';

export default [
  FieldSchema.defaulted('destinationAttr', 'data-transitioning-destination'),
  FieldSchema.defaulted('stateAttr', 'data-transitioning-state'),
  FieldSchema.required('initialState'),
  Fields.onHandler('onTransition'),
  Fields.onHandler('onFinish'),
  FieldSchema.requiredOf(
    'routes',
    StructureSchema.setOf(
      Result.value,
      StructureSchema.setOf(
        Result.value,
        StructureSchema.objOfOnly([
          FieldSchema.optionObjOfOnly('transition', [
            FieldSchema.required('property'),
            FieldSchema.required('transitionClass')
          ])
        ])
      )
    )
  )
];
