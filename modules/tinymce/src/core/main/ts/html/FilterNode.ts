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

const traverse = (root: AstNode, fn: (node: AstNode) => void): void => {
  let node: AstNode | null | undefined = root;
  while ((node = node.walk())) {
    fn(node);
  }
};

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
    traverse(node, (childNode) => {
      matchNode(nodeFilters, attributeFilters, childNode, matches);
    });
  }

  return matches;
};

// Run all necessary node filters and attribute filters, based on a match set
const runFilters = (matches: FilterMatches, args: ParserArgs): void => {
  const run = (matchRecord: Record<string, FilterMatch>, filteringAttributes: boolean) => {
    Obj.each(matchRecord, (match) => {
      // in theory we don't need to copy the array, it was created purely for this filtering, but the method is exported so we can't guarantee that
      const nodes = Arr.from(match.nodes);

      Arr.each(match.filter.callbacks, (callback) => {
        // very very carefully mutate the nodes array based on whether the filter still matches them
        for (let i = nodes.length - 1; i >= 0; i--) {
          const node = nodes[i];

          // Remove already removed children, and nodes that no longer match the filter
          const valueMatches = filteringAttributes ? node.attr(match.filter.name) !== undefined : node.name === match.filter.name;
          if (!valueMatches || Type.isNullable(node.parent)) {
            nodes.splice(i, 1);
          }
        }

        if (nodes.length > 0) {
          callback(nodes, match.filter.name, args);
        }
      });
    });
  };

  run(matches.nodes, false);
  run(matches.attributes, true);
};

const filter = (nodeFilters: ParserFilter[], attributeFilters: ParserFilter[], node: AstNode, args: ParserArgs = {}): void => {
  const matches = findMatchingNodes(nodeFilters, attributeFilters, node);
  runFilters(matches, args);
};

export {
  matchNode,
  runFilters,
  filter,
  traverse // Exposed for testing.
};
