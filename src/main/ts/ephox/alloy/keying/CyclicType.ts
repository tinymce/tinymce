import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as TabbingTypes from './TabbingTypes';

export default TabbingTypes.create(
  FieldSchema.state('cyclic', Fun.constant(true))
);