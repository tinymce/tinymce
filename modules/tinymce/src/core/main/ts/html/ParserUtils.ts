/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Node from '../api/html/Node';

const paddEmptyNode = function (settings, args, blockElements, node) {
  const brPreferred = settings.padd_empty_with_br || args.insert;

  if (brPreferred && blockElements[node.name]) {
    node.empty().append(new Node('br', 1)).shortEnded = true;
  } else {
    node.empty().append(new Node('#text', 3)).value = '\u00a0';
  }
};

const isPaddedWithNbsp = function (node) {
  return hasOnlyChild(node, '#text') && node.firstChild.value === '\u00a0';
};

const hasOnlyChild = function (node, name) {
  return node && node.firstChild && node.firstChild === node.lastChild && node.firstChild.name === name;
};

const isPadded = function (schema, node) {
  const rule = schema.getElementRule(node.name);
  return rule && rule.paddEmpty;
};

const isEmpty = function (schema, nonEmptyElements, whitespaceElements, node) {
  return node.isEmpty(nonEmptyElements, whitespaceElements, function (node) {
    return isPadded(schema, node);
  });
};

const isLineBreakNode = (node, blockElements) => node && (blockElements[node.name] || node.name === 'br');

export {
  paddEmptyNode,
  isPaddedWithNbsp,
  hasOnlyChild,
  isEmpty,
  isLineBreakNode
};
