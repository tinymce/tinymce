/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj } from '@ephox/katamari';

import { ParserFilter, ParserFilterCallback } from '../api/html/DomParser';
import AstNode from '../api/html/Node';

interface FilterMatch {
  filter: ParserFilter;
  nodes: AstNode[];
}

interface FilterMatchMap { [key: string]: FilterMatch }

const traverse = (node: AstNode, fn: (node: AstNode) => void): void => {
  fn(node);

  if (node.firstChild) {
    traverse(node.firstChild, fn);
  }

  if (node.next) {
    traverse(node.next, fn);
  }
};

const findMatchingNodes = (nodeFilters: ParserFilter[], attributeFilters: ParserFilter[], node: AstNode): FilterMatch[] => {
  const nodeMatches: FilterMatchMap = {};
  const attrMatches: FilterMatchMap = {};
  const matches: FilterMatch[] = [];

  if (node.firstChild) {
    traverse(node.firstChild, (node) => {
      Arr.each(nodeFilters, (filter) => {
        if (filter.name === node.name) {
          if (nodeMatches[filter.name]) {
            nodeMatches[filter.name].nodes.push(node);
          } else {
            nodeMatches[filter.name] = { filter, nodes: [ node ] };
          }
        }
      });

      Arr.each(attributeFilters, (filter) => {
        if (typeof node.attr(filter.name) === 'string') {
          if (attrMatches[filter.name]) {
            attrMatches[filter.name].nodes.push(node);
          } else {
            attrMatches[filter.name] = { filter, nodes: [ node ] };
          }
        }
      });
    });
  }

  for (const name in nodeMatches) {
    if (Obj.has(nodeMatches, name)) {
      matches.push(nodeMatches[name]);
    }
  }

  for (const name in attrMatches) {
    if (Obj.has(attrMatches, name)) {
      matches.push(attrMatches[name]);
    }
  }

  return matches;
};

const filter = (nodeFilters: ParserFilter[], attributeFilters: ParserFilter[], node: AstNode): void => {
  const matches = findMatchingNodes(nodeFilters, attributeFilters, node);

  Arr.each(matches, (match: FilterMatch) => {
    Arr.each(match.filter.callbacks, (callback: ParserFilterCallback) => {
      callback(match.nodes, match.filter.name, {});
    });
  });
};

export {
  filter
};
