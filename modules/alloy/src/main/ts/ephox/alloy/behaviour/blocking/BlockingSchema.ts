import { FieldSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import * as Fields from '../../data/Fields';

export default [
  // The blocking behaviour places a blocking element over the DOM while the
  // component is in the blocked state. If a function is provided here that
  // returns Some, then the blocking element will be added as a child of the
  // element returned. Otherwise, it will be added as a child of the main
  // component.
  FieldSchema.defaultedFunction('getRoot', Optional.none),
  // This boolean, if provided, will specify whether the blocking element is
  // focused when the component is first blocked
  FieldSchema.defaultedBoolean('focus', true),
  // This function, if provided, will be called any time the component is
  // blocked (unless it was already blocked).
  Fields.onHandler('onBlock'),
  // This function, if provided, will be called any time the component is
  // unblocked (unless it was already unblocked).
  Fields.onHandler('onUnblock')
];
