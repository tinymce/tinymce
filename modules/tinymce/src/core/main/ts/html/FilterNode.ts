import { Arr, Obj, Type } from '@ephox/katamari';

import { ParserArgs, ParserFilter } from '../api/html/DomParser';
import AstNode from '../api/html/Node';

interface FilterMatch {
  readonly filter: ParserFilter;
  readonly nodes: AstNode[];
}

export interface FilterMatches {
  readonly nodes: Record<string, FilterMatch>;
  readonly attributes: Record<string, FilterMatch>;
}

const trampoline = (fn: any) => (...args: any) => {
  let result = fn(...args);
  while (typeof result === 'function') {
    result = result();
  }
  return result;
};

const traverseRec = (nodes: AstNode[], fn: (node: AstNode) => void): void | VoidFunction => {
  if (nodes.length === 0) {
    return;
  }
  Arr.each(nodes, fn);

  const nextNodes: AstNode[] = Arr.foldl(nodes, (acc: AstNode[], node) => {
    if (node.firstChild) {
      acc.push(node.firstChild);
    }
    if (node.next) {
      acc.push(node.next);
    }
    return acc;
  }, []);

  return () => traverseRec(nextNodes, fn);
};

const traverse = trampoline(traverseRec);

// Test a single node against the current filters, and add it to any match lists if necessary
const matchNode = (nodeFilters: ParserFilter[], attributeFilters: ParserFilter[], node: AstNode, matches: FilterMatches): void => {
  const name = node.name;
  // Match node filters
  for (let ni = 0, nl = nodeFilters.length; ni < nl; ni++) {
    const filter = nodeFilters[ni];
    if (filter.name === name) {
      const match = matches.nodes[name];

      if (match) {
        match.nodes.push(node);
      } else {
        matches.nodes[name] = { filter, nodes: [ node ] };
      }
    }
  }

  // Match attribute filters
  if (node.attributes) {
    for (let ai = 0, al = attributeFilters.length; ai < al; ai++) {
      const filter = attributeFilters[ai];
      const attrName = filter.name;

      if (attrName in node.attributes.map) {
        const match = matches.attributes[attrName];

        if (match) {
          match.nodes.push(node);
        } else {
          matches.attributes[attrName] = { filter, nodes: [ node ] };
        }
      }
    }
  }
};

const findMatchingNodes = (nodeFilters: ParserFilter[], attributeFilters: ParserFilter[], node: AstNode): FilterMatches => {
  const matches: FilterMatches = { nodes: {}, attributes: {}};

  if (node.firstChild) {
    traverse([ node.firstChild ], (node: AstNode) => {
      matchNode(nodeFilters, attributeFilters, node, matches);
    });
  }

  return matches;
};

// Run all necessary node filters and attribute filters, based on a match set
const runFilters = (matches: FilterMatches, args: ParserArgs): void => {
  const run = (matchRecord: Record<string, FilterMatch>) => {
    Obj.each(matchRecord, (match) => {
      // Remove already removed children
      const nodes = Arr.filter(match.nodes, (node) => Type.isNonNullable(node.parent));

      Arr.each(match.filter.callbacks, (callback) => {
        callback(nodes, match.filter.name, args);
      });
    });
  };

  run(matches.nodes);
  run(matches.attributes);
};

const filter = (nodeFilters: ParserFilter[], attributeFilters: ParserFilter[], node: AstNode, args: ParserArgs = {}): void => {
  const matches = findMatchingNodes(nodeFilters, attributeFilters, node);
  runFilters(matches, args);
};

export {
  matchNode,
  runFilters,
  filter
};
