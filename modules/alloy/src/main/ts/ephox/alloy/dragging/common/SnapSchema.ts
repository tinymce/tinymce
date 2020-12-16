import { FieldSchema } from '@ephox/boulder';

import * as Boxes from '../../alien/Boxes';
import * as Fields from '../../data/Fields';

export default FieldSchema.optionObjOf('snaps', [
  FieldSchema.strict('getSnapPoints'),
  Fields.onHandler('onSensor'),
  FieldSchema.strict('leftAttr'),
  FieldSchema.strict('topAttr'),
  FieldSchema.defaulted('lazyViewport', Boxes.win),
  FieldSchema.defaulted('mustSnap', false)
]);