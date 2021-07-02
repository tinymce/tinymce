import { FieldSchema } from '@ephox/boulder';

import * as Boxes from '../../alien/Boxes';
import * as Fields from '../../data/Fields';

export default FieldSchema.optionObjOf('snaps', [
  FieldSchema.required('getSnapPoints'),
  Fields.onHandler('onSensor'),
  FieldSchema.required('leftAttr'),
  FieldSchema.required('topAttr'),
  FieldSchema.defaulted('lazyViewport', Boxes.win),
  FieldSchema.defaulted('mustSnap', false)
]);