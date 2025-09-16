import { Fun } from '@ephox/katamari';

import type AstNode from 'tinymce/core/api/html/Node';

import * as AttributeUtils from './AttributeUtils';

const AstNodeAdapter: AttributeUtils.AttributeOperationAdapter<AstNode> = {
  setAttribute: (element, name, value) => element.attr(name, value),
  hasAttribute: (element, name) => element.attr(name) !== undefined,
  getAttribute: (element, name) => element.attr(name),
  removeAttribute: (element, name) => element.attr(name, null)
};

const addTemporaryAttributes = Fun.curry(AttributeUtils.addTemporaryAttributes, AstNodeAdapter);
const restoreNormalState = Fun.curry(AttributeUtils.restoreNormalState, AstNodeAdapter);

export {
  addTemporaryAttributes,
  restoreNormalState
};
