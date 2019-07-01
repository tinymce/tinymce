/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, Node } from '@ephox/dom-globals';
import Schema from 'tinymce/core/api/html/Schema';

function isContentEditableFalse(node: HTMLElement) {
  return node && node.nodeType === 1 && node.contentEditable === 'false';
}

// Based on work developed by: James Padolsey http://james.padolsey.com
// released under UNLICENSE that is compatible with LGPL
// TODO: Handle contentEditable edgecase:
// <p>text<span contentEditable="false">text<span contentEditable="true">text</span>text</span>text</p>
function findAndReplaceDOMText(regex: RegExp, node: Node, replacementNode: Node, captureGroup: number | false, schema: Schema) {
  let m;
  const matches = [];
  let text, count = 0, doc;
  let blockElementsMap, hiddenTextElementsMap, shortEndedElementsMap;

  doc = node.ownerDocument;
  blockElementsMap = schema.getBlockElements(); // H1-H6, P, TD etc
  hiddenTextElementsMap = schema.getWhiteSpaceElements(); // TEXTAREA, PRE, STYLE, SCRIPT
  shortEndedElementsMap = schema.getShortEndedElements(); // BR, IMG, INPUT

  function getMatchIndexes(m: RegExpMatchArray, captureGroup: number | false) {
    captureGroup = captureGroup || 0;

    if (!m[0]) {
      throw new Error('findAndReplaceDOMText cannot handle zero-length matches');
    }

    let index = m.index;

    if (captureGroup > 0) {
      const cg = m[captureGroup];

      if (!cg) {
        throw new Error('Invalid capture group');
      }

      index += m[0].indexOf(cg);
      m[0] = cg;
    }

    return [index, index + m[0].length, [m[0]]];
  }

  function getText(node) {
    let txt;

    if (node.nodeType === 3) {
      return node.data;
    }

    if (hiddenTextElementsMap[node.nodeName] && !blockElementsMap[node.nodeName]) {
      return '';
    }

    txt = '';

    if (isContentEditableFalse(node)) {
      return '\n';
    }

    if (blockElementsMap[node.nodeName] || shortEndedElementsMap[node.nodeName]) {
      txt += '\n';
    }

    if ((node = node.firstChild)) {
      do {
        txt += getText(node);
      } while ((node = node.nextSibling));
    }

    return txt;
  }

  function stepThroughMatches(node, matches, replaceFn) {
    let startNode, endNode, startNodeIndex,
      endNodeIndex, innerNodes = [], atIndex = 0, curNode = node,
      matchLocation = matches.shift(), matchIndex = 0;

    out: while (true) {
      if (blockElementsMap[curNode.nodeName] || shortEndedElementsMap[curNode.nodeName] || isContentEditableFalse(curNode)) {
        atIndex++;
      }

      if (curNode.nodeType === 3) {
        if (!endNode && curNode.length + atIndex >= matchLocation[1]) {
          // We've found the ending
          endNode = curNode;
          endNodeIndex = matchLocation[1] - atIndex;
        } else if (startNode) {
          // Intersecting node
          innerNodes.push(curNode);
        }

        if (!startNode && curNode.length + atIndex > matchLocation[0]) {
          // We've found the match start
          startNode = curNode;
          startNodeIndex = matchLocation[0] - atIndex;
        }

        atIndex += curNode.length;
      }

      if (startNode && endNode) {
        curNode = replaceFn({
          startNode,
          startNodeIndex,
          endNode,
          endNodeIndex,
          innerNodes,
          match: matchLocation[2],
          matchIndex
        });

        // replaceFn has to return the node that replaced the endNode
        // and then we step back so we can continue from the end of the
        // match:
        atIndex -= (endNode.length - endNodeIndex);
        startNode = null;
        endNode = null;
        innerNodes = [];
        matchLocation = matches.shift();
        matchIndex++;

        if (!matchLocation) {
          break; // no more matches
        }
      } else if ((!hiddenTextElementsMap[curNode.nodeName] || blockElementsMap[curNode.nodeName]) && curNode.firstChild) {
        if (!isContentEditableFalse(curNode)) {
          // Move down
          curNode = curNode.firstChild;
          continue;
        }
      } else if (curNode.nextSibling) {
        // Move forward:
        curNode = curNode.nextSibling;
        continue;
      }

      // Move forward or up:
      while (true) {
        if (curNode.nextSibling) {
          curNode = curNode.nextSibling;
          break;
        } else if (curNode.parentNode !== node) {
          curNode = curNode.parentNode;
        } else {
          break out;
        }
      }
    }
  }

  /**
  * Generates the actual replaceFn which splits up text nodes
  * and inserts the replacement element.
  */
  function genReplacer(nodeName) {
    let makeReplacementNode;

    if (typeof nodeName !== 'function') {
      const stencilNode = nodeName.nodeType ? nodeName : doc.createElement(nodeName);

      makeReplacementNode = function (fill, matchIndex) {
        const clone = stencilNode.cloneNode(false);

        clone.setAttribute('data-mce-index', matchIndex);

        if (fill) {
          clone.appendChild(doc.createTextNode(fill));
        }

        return clone;
      };
    } else {
      makeReplacementNode = nodeName;
    }

    return function (range) {
      let before;
      let after;
      let parentNode;
      const startNode = range.startNode;
      const endNode = range.endNode;
      const matchIndex = range.matchIndex;

      if (startNode === endNode) {
        const node = startNode;

        parentNode = node.parentNode;
        if (range.startNodeIndex > 0) {
          // Add `before` text node (before the match)
          before = doc.createTextNode(node.data.substring(0, range.startNodeIndex));
          parentNode.insertBefore(before, node);
        }

        // Create the replacement node:
        const el = makeReplacementNode(range.match[0], matchIndex);
        parentNode.insertBefore(el, node);
        if (range.endNodeIndex < node.length) {
          // Add `after` text node (after the match)
          after = doc.createTextNode(node.data.substring(range.endNodeIndex));
          parentNode.insertBefore(after, node);
        }

        node.parentNode.removeChild(node);

        return el;
      }

      // Replace startNode -> [innerNodes...] -> endNode (in that order)
      before = doc.createTextNode(startNode.data.substring(0, range.startNodeIndex));
      after = doc.createTextNode(endNode.data.substring(range.endNodeIndex));
      const elA = makeReplacementNode(startNode.data.substring(range.startNodeIndex), matchIndex);
      const innerEls = [];

      for (let i = 0, l = range.innerNodes.length; i < l; ++i) {
        const innerNode = range.innerNodes[i];
        const innerEl = makeReplacementNode(innerNode.data, matchIndex);
        innerNode.parentNode.replaceChild(innerEl, innerNode);
        innerEls.push(innerEl);
      }

      const elB = makeReplacementNode(endNode.data.substring(0, range.endNodeIndex), matchIndex);

      parentNode = startNode.parentNode;
      parentNode.insertBefore(before, startNode);
      parentNode.insertBefore(elA, startNode);
      parentNode.removeChild(startNode);

      parentNode = endNode.parentNode;
      parentNode.insertBefore(elB, endNode);
      parentNode.insertBefore(after, endNode);
      parentNode.removeChild(endNode);

      return elB;
    };
  }

  text = getText(node);
  if (!text) {
    return;
  }

  if (regex.global) {
    while ((m = regex.exec(text))) {
      matches.push(getMatchIndexes(m, captureGroup));
    }
  } else {
    m = text.match(regex);
    matches.push(getMatchIndexes(m, captureGroup));
  }

  if (matches.length) {
    count = matches.length;
    stepThroughMatches(node, matches, genReplacer(replacementNode));
  }

  return count;
}

export default {
  findAndReplaceDOMText
};
