/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const isContentEditableFalse = (node: Node | null): boolean =>
  node && node.nodeType === 1 && (node as HTMLElement).contentEditable === 'false';

export interface Match {
  start: number;
  end: number;
  text: string;
  data: Record<string, any>;
  stencil?: Element;
}

export interface DomTextMatcher {
  readonly text: string;
  readonly matches: Match[];
  readonly each: (cb: Function) => this;
  readonly filter: (cb: Function) => this;
  readonly reset: () => DomTextMatcher;
  readonly matchFromElement: (element: Element) => Match;
  readonly elementFromMatch: (match: Match) => Element;
  readonly find: (regex: RegExp, data: Record<string, any>) => this;
  readonly add: (start: number, length: number, data: Record<string, any>) => this;
  readonly wrap: (cb: Function) => this;
  readonly unwrap: (match?: Match) => this;
  readonly replace: (match: Match, text: string) => Range;
  readonly rangeFromMatch: (match: Match) => Range;
  readonly indexOf: (match: Match) => number;
}

export const DomTextMatcher = (node: Element, editor: Editor): DomTextMatcher => {
  let m, matches: Match[] = [];
  const dom = editor.dom;

  const blockElementsMap = editor.schema.getBlockElements(); // H1-H6, P, TD etc
  const hiddenTextElementsMap = editor.schema.getWhiteSpaceElements(); // TEXTAREA, PRE, STYLE, SCRIPT
  const shortEndedElementsMap = editor.schema.getShortEndedElements(); // BR, IMG, INPUT

  const createMatch = (m: RegExpExecArray, data: Record<string, string>): Match => {
    if (!m[0]) {
      throw new Error('findAndReplaceDOMText cannot handle zero-length matches');
    }

    return {
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      data
    };
  };

  const getText = (node: Node) => {
    if (node.nodeType === 3) {
      return (node as Text).data;
    }

    if (hiddenTextElementsMap[node.nodeName] && !blockElementsMap[node.nodeName]) {
      return '';
    }

    if (isContentEditableFalse(node)) {
      return '\n';
    }

    let txt = '';

    if (blockElementsMap[node.nodeName] || shortEndedElementsMap[node.nodeName]) {
      txt += '\n';
    }

    if ((node = node.firstChild)) {
      do {
        txt += getText(node);
      } while ((node = node.nextSibling));
    }

    return txt;
  };

  const stepThroughMatches = (node, matches, replaceFn) => {
    let startNode, endNode, startNodeIndex,
      endNodeIndex, innerNodes = [], atIndex = 0, curNode = node,
      matchLocation, matchIndex = 0;

    matches = matches.slice(0);
    matches.sort((a, b) => {
      return a.start - b.start;
    });

    matchLocation = matches.shift();

    out: while (true) { // eslint-disable-line no-constant-condition
      if (blockElementsMap[curNode.nodeName] || shortEndedElementsMap[curNode.nodeName] || isContentEditableFalse(curNode)) {
        atIndex++;
      }

      if (curNode.nodeType === 3) {
        if (!endNode && curNode.length + atIndex >= matchLocation.end) {
          // We've found the ending
          endNode = curNode;
          endNodeIndex = matchLocation.end - atIndex;
        } else if (startNode) {
          // Intersecting node
          innerNodes.push(curNode);
        }

        if (!startNode && curNode.length + atIndex > matchLocation.start) {
          // We've found the match start
          startNode = curNode;
          startNodeIndex = matchLocation.start - atIndex;
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
          match: matchLocation.text,
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
      while (true) { // eslint-disable-line no-constant-condition
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
  };

  /**
  * Generates the actual replaceFn which splits up text nodes
  * and inserts the replacement element.
  */
  const genReplacer = (callback: (match: Match) => Element) => {
    const makeReplacementNode = (fill: string, matchIndex: number) => {
      const match = matches[matchIndex];

      if (!match.stencil) {
        match.stencil = callback(match);
      }

      const clone = match.stencil.cloneNode(false) as Element;
      clone.setAttribute('data-mce-index', '' + matchIndex);

      if (fill) {
        clone.appendChild(dom.doc.createTextNode(fill));
      }

      return clone;
    };

    return (range) => {
      let before;
      let after;
      let parentNode;
      const startNode = range.startNode;
      const endNode = range.endNode;
      const matchIndex = range.matchIndex;
      const doc = dom.doc;

      if (startNode === endNode) {
        const node = startNode;

        parentNode = node.parentNode;
        if (range.startNodeIndex > 0) {
          // Add "before" text node (before the match)
          before = doc.createTextNode(node.data.substring(0, range.startNodeIndex));
          parentNode.insertBefore(before, node);
        }

        // Create the replacement node:
        const el = makeReplacementNode(range.match, matchIndex);
        parentNode.insertBefore(el, node);
        if (range.endNodeIndex < node.length) {
          // Add "after" text node (after the match)
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
  };

  const unwrapElement = (element: Element): void => {
    const parentNode = element.parentNode;
    while (element.childNodes.length > 0) {
      parentNode.insertBefore(element.childNodes[0], element);
    }
    parentNode.removeChild(element);
  };

  const hasClass = (elm: Element): boolean => {
    return elm.className.indexOf('mce-spellchecker-word') !== -1;
  };

  const getWrappersByIndex = (index: number | string) => {
    const elements = node.getElementsByTagName('*'), wrappers = [];

    index = typeof index === 'number' ? '' + index : null;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i], dataIndex = element.getAttribute('data-mce-index');

      if (dataIndex !== null && dataIndex.length && hasClass(element)) {
        if (dataIndex === index || index === null) {
          wrappers.push(element);
        }
      }
    }

    return wrappers;
  };

  /**
  * Returns the index of a specific match object or -1 if it isn't found.
  *
  * @param  {Match} match Text match object.
  * @return {Number} Index of match or -1 if it isn't found.
  */
  const indexOf = (match: Match) => {
    let i = matches.length;
    while (i--) {
      if (matches[i] === match) {
        return i;
      }
    }

    return -1;
  };

  /**
  * Filters the matches. If the callback returns true it stays if not it gets removed.
  *
  * @param {Function} callback Callback to execute for each match.
  * @return {DomTextMatcher} Current DomTextMatcher instance.
  */
  function filter(callback: (match: Match, index: number) => boolean) {
    const filteredMatches: Match[] = [];

    each((match, i) => {
      if (callback(match, i)) {
        filteredMatches.push(match);
      }
    });

    matches = filteredMatches;

    /* jshint validthis:true*/
    return this;
  }

  /**
  * Executes the specified callback for each match.
  *
  * @param {Function} callback  Callback to execute for each match.
  * @return {DomTextMatcher} Current DomTextMatcher instance.
  */
  function each(callback: (match: Match, index: number) => boolean | void) {
    for (let i = 0, l = matches.length; i < l; i++) {
      if (callback(matches[i], i) === false) {
        break;
      }
    }

    /* jshint validthis:true*/
    return this;
  }

  /**
  * Wraps the current matches with nodes created by the specified callback.
  * Multiple clones of these matches might occur on matches that are on multiple nodex.
  *
  * @param {Function} callback Callback to execute in order to create elements for matches.
  * @return {DomTextMatcher} Current DomTextMatcher instance.
  */
  function wrap(callback: (match: Match) => Element) {
    if (matches.length) {
      stepThroughMatches(node, matches, genReplacer(callback));
    }

    /* jshint validthis:true*/
    return this;
  }

  /**
  * Finds the specified regexp and adds them to the matches collection.
  *
  * @param {RegExp} regex Global regexp to search the current node by.
  * @param {Object} [data] Optional custom data element for the match.
  * @return {DomTextMatcher} Current DomTextMatcher instance.
  */
  function find(regex: RegExp, data: Record<string, any>) {
    if (text && regex.global) {
      while ((m = regex.exec(text))) {
        matches.push(createMatch(m, data));
      }
    }

    return this;
  }

  /**
  * Unwraps the specified match object or all matches if unspecified.
  *
  * @param {Object} [match] Optional match object.
  * @return {DomTextMatcher} Current DomTextMatcher instance.
  */
  function unwrap(match?: Match) {
    let i;
    const elements = getWrappersByIndex(match ? indexOf(match) : null);

    i = elements.length;
    while (i--) {
      unwrapElement(elements[i]);
    }

    return this;
  }

  /**
  * Returns a match object by the specified DOM element.
  *
  * @param {DOMElement} element Element to return match object for.
  * @return {Object} Match object for the specified element.
  */
  const matchFromElement = (element: Element) => {
    return matches[element.getAttribute('data-mce-index')];
  };

  /**
  * Returns a DOM element from the specified match element. This will be the first element if it's split
  * on multiple nodes.
  *
  * @param {Object} match Match element to get first element of.
  * @return {DOMElement} DOM element for the specified match object.
  */
  const elementFromMatch = (match: Match) => {
    return getWrappersByIndex(indexOf(match))[0];
  };

  /**
  * Adds match the specified range for example a grammar line.
  *
  * @param {Number} start Start offset.
  * @param {Number} length Length of the text.
  * @param {Object} data Custom data object for match.
  * @return {DomTextMatcher} Current DomTextMatcher instance.
  */
  function add(start: number, length: number, data: Record<string, any>) {
    matches.push({
      start,
      end: start + length,
      text: text.substr(start, length),
      data
    });

    return this;
  }

  /**
  * Returns a DOM range for the specified match.
  *
  * @param  {Object} match Match object to get range for.
  * @return {DOMRange} DOM Range for the specified match.
  */
  const rangeFromMatch = (match: Match) => {
    const wrappers = getWrappersByIndex(indexOf(match));

    const rng = editor.dom.createRng();
    rng.setStartBefore(wrappers[0]);
    rng.setEndAfter(wrappers[wrappers.length - 1]);

    return rng;
  };

  /**
  * Replaces the specified match with the specified text.
  *
  * @param {Object} match Match object to replace.
  * @param {String} text Text to replace the match with.
  * @return {DOMRange} DOM range produced after the replace.
  */
  const replace = (match: Match, text: string) => {
    const rng = rangeFromMatch(match);

    rng.deleteContents();

    if (text.length > 0) {
      rng.insertNode(editor.dom.doc.createTextNode(text));
    }

    return rng;
  };

  /**
  * Resets the DomTextMatcher instance. This will remove any wrapped nodes and remove any matches.
  *
  * @return {[type]} [description]
  */
  function reset() {
    matches.splice(0, matches.length);
    unwrap();

    return this;
  }

  const text = getText(node);

  return {
    text,
    matches,
    each,
    filter,
    reset,
    matchFromElement,
    elementFromMatch,
    find,
    add,
    wrap,
    unwrap,
    replace,
    rangeFromMatch,
    indexOf
  };
};
