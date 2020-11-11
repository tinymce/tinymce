import { FieldSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';
import * as Fields from '../../data/Fields';

export default [
  // The blocking behaviour optionally allows for a "blocker" component to be
  // added to the DOM while the component is in the blocked state. If a function
  // is provided here that returns Some, then blocker component will be added as
  // a child of the returned component.
  FieldSchema.defaultedFunction('getRoot', Optional.none),
  // This function, if provided, will be called any time the component is
  // blocked (unless it was already blocked).
  Fields.onHandler('onBlock'),
  // This function, if provided, will be called any time the component is
  // unblocked (unless it was already unblocked).
  Fields.onHandler('onUnblock')
];