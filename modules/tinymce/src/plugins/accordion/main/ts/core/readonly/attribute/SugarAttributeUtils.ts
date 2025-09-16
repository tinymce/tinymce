import { Fun } from '@ephox/katamari';
import { Attribute, type SugarElement } from '@ephox/sugar';

import * as AttributeUtils from './AttributeUtils';

const SugarElementAdapter: AttributeUtils.AttributeOperationAdapter<SugarElement<HTMLDetailsElement>> = {
  setAttribute: (element, name, value) => Attribute.set(element, name, value),
  hasAttribute: (element, name) => Attribute.has(element, name),
  getAttribute: (element, name) => Attribute.get(element, name),
  removeAttribute: (element, name) => Attribute.remove(element, name)
};

const addTemporaryAttributes = Fun.curry(AttributeUtils.addTemporaryAttributes, SugarElementAdapter);
const restoreNormalState = Fun.curry(AttributeUtils.restoreNormalState, SugarElementAdapter);

export {
  addTemporaryAttributes,
  restoreNormalState
};
