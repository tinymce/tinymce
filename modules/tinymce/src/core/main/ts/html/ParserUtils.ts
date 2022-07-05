import { Type, Unicode } from '@ephox/katamari';

import { DomParserSettings, ParserArgs } from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Schema, { SchemaMap } from '../api/html/Schema';

const paddEmptyNode = (settings: DomParserSettings, args: ParserArgs, blockElements: SchemaMap, node: AstNode): void => {
  if (args.insert && blockElements[node.name]) {
    const astNode = new AstNode('br', 1);
    astNode.attr('data-mce-bogus', '1');
    node.empty().append(astNode);
  } else {
    node.empty().append(new AstNode('#text', 3)).value = Unicode.nbsp;
  }
};

const isPaddedWithNbsp = (node: AstNode): boolean =>
  hasOnlyChild(node, '#text') && node?.firstChild?.value === Unicode.nbsp;

const hasOnlyChild = (node: AstNode, name: string): boolean => {
  const firstChild = node?.firstChild;
  return Type.isNonNullable(firstChild) && firstChild === node.lastChild && firstChild.name === name;
};

const isPadded = (schema: Schema, node: AstNode): boolean => {
  const rule = schema.getElementRule(node.name);
  return rule?.paddEmpty === true;
};

const isEmpty = (schema: Schema, nonEmptyElements: SchemaMap, whitespaceElements: SchemaMap, node: AstNode): boolean =>
  node.isEmpty(nonEmptyElements, whitespaceElements, (node) => isPadded(schema, node));

const isLineBreakNode = (node: AstNode | null | undefined, blockElements: SchemaMap): boolean =>
  Type.isNonNullable(node) && (node.name in blockElements || node.name === 'br');

export {
  paddEmptyNode,
  isPaddedWithNbsp,
  hasOnlyChild,
  isEmpty,
  isLineBreakNode
};
