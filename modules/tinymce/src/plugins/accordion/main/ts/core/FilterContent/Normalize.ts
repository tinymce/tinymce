import { Arr } from '@ephox/katamari';

import type AstNode from 'tinymce/core/api/html/Node';

import { openAttribute } from '../Identifiers';

const normalizeOpenAttribute = (node: AstNode): void => {
  if (hasAttribute(node, openAttribute)) {
    node.attr(openAttribute, 'open');
  }
};

const hasAttribute = (node: AstNode, attribute: string): boolean =>
  Arr.exists(node.attributes ?? [], ({ name }) => name === attribute);

export { normalizeOpenAttribute };
