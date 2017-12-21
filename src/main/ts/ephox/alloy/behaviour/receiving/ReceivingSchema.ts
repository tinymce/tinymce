import Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';



export default <any> [
  FieldSchema.strictOf('channels', ValueSchema.setOf(
    // Allow any keys.
    Result.value,
    ValueSchema.objOfOnly([
      Fields.onStrictHandler('onReceive'),
      FieldSchema.defaulted('schema', ValueSchema.anyValue())
    ])
  ))
];