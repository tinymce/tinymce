/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Node from '../api/html/Node';
import { ParserFilter, ParserFilterCallback } from '../api/html/DomParser';
import { Arr } from '@ephox/katamari';

interface FilterMatch {
  filter: ParserFilter;
  nodes: Node[];
}

interface FilterMatchMap { [key: string]: FilterMatch }

const traverse = (node: Node, fn: (node: Node) => void): void => {
  fn(node);

  if (node.firstChild) {
    traverse(node.firstChild, fn);
  }

  if (node.next) {
    traverse(node.next, fn);
  }
};

const findMatchingNodes = (nodeFilters: ParserFilter[], attributeFilters: ParserFilter[], node: Node): FilterMatch[] => {
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
    if (nodeMatches.hasOwnProperty(name)) {
      matches.push(nodeMatches[name]);
    }
  }

  for (const name in attrMatches) {
    if (attrMatches.hasOwnProperty(name)) {
      matches.push(attrMatches[name]);
    }
  }

  return matches;
};

const filter = (nodeFilters: ParserFilter[], attributeFilters: ParserFilter[], node: Node): void => {
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
