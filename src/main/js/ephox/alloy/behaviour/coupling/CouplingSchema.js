import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Obj } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { Result } from '@ephox/katamari';



export default <any> [
  FieldSchema.strictOf('others', ValueSchema.setOf(Result.value, ValueSchema.anyValue()))
];