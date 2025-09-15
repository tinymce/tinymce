
import type AstNode from 'tinymce/core/api/html/Node';

const normalizeOpenAttribute = (node: AstNode): void => {
  if (hasAttribute(node, 'open')) {
    setAttribute(node, 'open', 'open');
  }
};

const hasAttribute = (node: AstNode, attribute: string): boolean =>
  node.attr(attribute) !== undefined;

const setAttribute = (node: AstNode, attribute: string, value: string): void => {
  node.attr(attribute, value);
};

export { normalizeOpenAttribute };
