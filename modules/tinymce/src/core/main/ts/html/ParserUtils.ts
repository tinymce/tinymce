import { Optional, Type, Unicode } from '@ephox/katamari';

import { DomParserSettings, ParserArgs } from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Schema, { SchemaMap } from '../api/html/Schema';

const paddEmptyNode = (settings: DomParserSettings, args: ParserArgs, isBlock: (node: AstNode) => boolean, node: AstNode): void => {
  const brPreferred = settings.pad_empty_with_br || args.insert;
  if (brPreferred && isBlock(node)) {
    const astNode = new AstNode('br', 1);
    if (args.insert) {
      astNode.attr('data-mce-bogus', '1');
    }
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

const isLineBreakNode = (node: AstNode | null | undefined, isBlock: (node: AstNode) => boolean): boolean =>
  Type.isNonNullable(node) && (isBlock(node) || node.name === 'br');

const findClosestEditingHost = (scope: AstNode): Optional<AstNode> => {
  let editableNode;

  for (let node: AstNode | undefined | null = scope; node; node = node.parent) {
    const contentEditable = node.attr('contenteditable');

    if (contentEditable === 'false') {
      break;
    } else if (contentEditable === 'true') {
      editableNode = node;
    }
  }

  return Optional.from(editableNode);
};

export {
  paddEmptyNode,
  isPaddedWithNbsp,
  hasOnlyChild,
  isEmpty,
  isLineBreakNode,
  findClosestEditingHost
};
