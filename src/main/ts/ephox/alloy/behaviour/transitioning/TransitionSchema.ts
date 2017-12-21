import Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';



export default <any> [
  FieldSchema.defaulted('destinationAttr', 'data-transitioning-destination'),
  FieldSchema.defaulted('stateAttr', 'data-transitioning-state'),
  FieldSchema.strict('initialState'),
  Fields.onHandler('onTransition'),
  Fields.onHandler('onFinish'),
  FieldSchema.strictOf(
    'routes',
    ValueSchema.setOf(
      Result.value,
      ValueSchema.setOf(
        Result.value,
        ValueSchema.objOfOnly([
          FieldSchema.optionObjOfOnly('transition', [
            FieldSchema.strict('property'),
            FieldSchema.strict('transitionClass')
          ])
        ])
      )
    )
  )
];