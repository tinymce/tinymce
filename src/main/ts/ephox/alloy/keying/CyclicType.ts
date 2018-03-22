import * as TabbingTypes from './TabbingTypes';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

export default <any> TabbingTypes.create(
  FieldSchema.state('cyclic', Fun.constant(true))
);