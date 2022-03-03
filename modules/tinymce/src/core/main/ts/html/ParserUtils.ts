import { Unicode } from '@ephox/katamari';

import { DomParserSettings, ParserArgs } from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Schema, { SchemaMap } from '../api/html/Schema';

const paddEmptyNode = (settings: DomParserSettings, args: ParserArgs, blockElements: SchemaMap, node: AstNode): void => {
  if (args.insert && blockElements[node.name]) {
    node.empty().append(new AstNode('br', 1));
  } else {
    node.empty().append(new AstNode('#text', 3)).value = Unicode.nbsp;
  }
};

const isPaddedWithNbsp = (node: AstNode): boolean =>
  hasOnlyChild(node, '#text') && node.firstChild.value === Unicode.nbsp;

const hasOnlyChild = (node: AstNode, name: string): boolean =>
  node && node.firstChild && node.firstChild === node.lastChild && node.firstChild.name === name;

const isPadded = (schema: Schema, node: AstNode): boolean => {
  const rule = schema.getElementRule(node.name);
  return rule && rule.paddEmpty;
};

const isEmpty = (schema: Schema, nonEmptyElements: SchemaMap, whitespaceElements: SchemaMap, node: AstNode): boolean =>
  node.isEmpty(nonEmptyElements, whitespaceElements, (node) => isPadded(schema, node));

const isLineBreakNode = (node: AstNode | undefined, blockElements: SchemaMap): boolean =>
  node && (node.name in blockElements || node.name === 'br');

export {
  paddEmptyNode,
  isPaddedWithNbsp,
  hasOnlyChild,
  isEmpty,
  isLineBreakNode
};
