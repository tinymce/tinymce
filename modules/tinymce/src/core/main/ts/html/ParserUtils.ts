/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Unicode } from '@ephox/katamari';
import { DomParserSettings, ParserArgs } from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Schema, { SchemaMap } from '../api/html/Schema';

const paddEmptyNode = (settings: DomParserSettings, args: ParserArgs, blockElements: SchemaMap, node: AstNode) => {
  const brPreferred = settings.padd_empty_with_br || args.insert;

  if (brPreferred && blockElements[node.name]) {
    node.empty().append(new AstNode('br', 1)).shortEnded = true;
  } else {
    node.empty().append(new AstNode('#text', 3)).value = Unicode.nbsp;
  }
};

const isPaddedWithNbsp = (node: AstNode) => hasOnlyChild(node, '#text') && node.firstChild.value === Unicode.nbsp;

const hasOnlyChild = (node: AstNode, name: string) => node && node.firstChild && node.firstChild === node.lastChild && node.firstChild.name === name;

const isPadded = (schema: Schema, node: AstNode) => {
  const rule = schema.getElementRule(node.name);
  return rule && rule.paddEmpty;
};

const isEmpty = (schema: Schema, nonEmptyElements: SchemaMap, whitespaceElements: SchemaMap, node: AstNode) => node.isEmpty(nonEmptyElements, whitespaceElements, (node) => isPadded(schema, node));

const isLineBreakNode = (node: AstNode, blockElements: SchemaMap) => node && (blockElements[node.name] || node.name === 'br');

export {
  paddEmptyNode,
  isPaddedWithNbsp,
  hasOnlyChild,
  isEmpty,
  isLineBreakNode
};
