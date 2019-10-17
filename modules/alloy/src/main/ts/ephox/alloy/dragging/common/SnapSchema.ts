import { FieldSchema } from '@ephox/boulder';

import * as Fields from '../../data/Fields';
import * as Boxes from '../../alien/Boxes';

export default FieldSchema.optionObjOf('snaps', [
  FieldSchema.strict('getSnapPoints'),
  Fields.onHandler('onSensor'),
  FieldSchema.strict('leftAttr'),
  FieldSchema.strict('topAttr'),
  FieldSchema.defaulted('lazyViewport', Boxes.win),
  FieldSchema.defaulted('mustSnap', false)
]);