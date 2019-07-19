/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Node } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Tools from 'tinymce/core/api/util/Tools';
import FindReplaceText from './FindReplaceText';

export interface SearchState {
  index: number;
  count: number;
  text: string;
  matchCase: boolean;
  wholeWord: boolean;
}

const getElmIndex = function (elm: Element) {
  const value = elm.getAttribute('data-mce-index');

  if (typeof value === 'number') {
    return '' + value;
  }

  return value;
};

const markAllMatches = function (editor: Editor, currentSearchState: Cell<SearchState>, regex: RegExp) {
  let node, marker;

  marker = editor.dom.create('span', {
    'data-mce-bogus': 1
  });

  marker.className = 'mce-match-marker'; // IE 7 adds class="mce-match-marker" and class=mce-match-marker
  node = editor.getBody();

  done(editor, currentSearchState, false);

  return FindReplaceText.findAndReplaceDOMText(regex, node, marker, false, editor.schema);
};

const unwrap = function (node: Node) {
  const parentNode = node.parentNode;

  if (node.firstChild) {
    parentNode.insertBefore(node.firstChild, node);
  }

  node.parentNode.removeChild(node);
};

const findSpansByIndex = function (editor: Editor, index: number) {
  let nodes;
  const spans = [];

  nodes = Tools.toArray(editor.getBody().getElementsByTagName('span'));
  if (nodes.length) {
    for (let i = 0; i < nodes.length; i++) {
      const nodeIndex = getElmIndex(nodes[i]);

      if (nodeIndex === null || !nodeIndex.length) {
        continue;
      }

      if (nodeIndex === index.toString()) {
        spans.push(nodes[i]);
      }
    }
  }

  return spans;
};

const moveSelection = function (editor: Editor, currentSearchState: Cell<SearchState>, forward: boolean) {
  const searchState = currentSearchState.get();
  let testIndex = searchState.index;
  const dom = editor.dom;

  forward = forward !== false;

  if (forward) {
    if (testIndex + 1 === searchState.count) {
      testIndex = 0;
    } else {
      testIndex++;
    }
  } else {
    if (testIndex - 1 === -1) {
      testIndex = searchState.count - 1;
    } else {
      testIndex--;
    }
  }

  dom.removeClass(findSpansByIndex(editor, searchState.index), 'mce-match-marker-selected');

  const spans = findSpansByIndex(editor, testIndex);
  if (spans.length) {
    dom.addClass(findSpansByIndex(editor, testIndex), 'mce-match-marker-selected');
    editor.selection.scrollIntoView(spans[0]);
    return testIndex;
  }

  return -1;
};

const removeNode = function (dom: DOMUtils, node: Node) {
  const parent = node.parentNode;

  dom.remove(node);

  if (dom.isEmpty(parent)) {
    dom.remove(parent);
  }
};

const find = function (editor: Editor, currentSearchState: Cell<SearchState>, text: string, matchCase: boolean, wholeWord: boolean) {
  text = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  text = text.replace(/\s/g, '[^\\S\\r\\n]');
  text = wholeWord ? '\\b' + text + '\\b' : text;

  const count = markAllMatches(editor, currentSearchState, new RegExp(text, matchCase ? 'g' : 'gi'));

  if (count) {
    const newIndex = moveSelection(editor, currentSearchState, true);
    currentSearchState.set({
      index: newIndex,
      count,
      text,
      matchCase,
      wholeWord
    });
  }

  return count;
};

const next = function (editor: Editor, currentSearchState: Cell<SearchState>) {
  const index = moveSelection(editor, currentSearchState, true);
  currentSearchState.set({ ...currentSearchState.get(), index });
};

const prev = function (editor: Editor, currentSearchState: Cell<SearchState>) {
  const index = moveSelection(editor, currentSearchState, false);
  currentSearchState.set({ ...currentSearchState.get(), index });
};

const isMatchSpan = function (node: Element) {
  const matchIndex = getElmIndex(node);

  return matchIndex !== null && matchIndex.length > 0;
};

const replace = function (editor: Editor, currentSearchState: Cell<SearchState>, text: string, forward?: boolean, all?: boolean) {
  const searchState = currentSearchState.get();
  const currentIndex = searchState.index;
  let i, nodes, node, matchIndex, currentMatchIndex, nextIndex = currentIndex;

  forward = forward !== false;

  node = editor.getBody();
  nodes = Tools.grep(Tools.toArray(node.getElementsByTagName('span')), isMatchSpan);
  for (i = 0; i < nodes.length; i++) {
    const nodeIndex = getElmIndex(nodes[i]);

    matchIndex = currentMatchIndex = parseInt(nodeIndex, 10);
    if (all || matchIndex === searchState.index) {
      if (text.length) {
        nodes[i].firstChild.nodeValue = text;
        unwrap(nodes[i]);
      } else {
        removeNode(editor.dom, nodes[i]);
      }

      while (nodes[++i]) {
        matchIndex = parseInt(getElmIndex(nodes[i]), 10);

        if (matchIndex === currentMatchIndex) {
          removeNode(editor.dom, nodes[i]);
        } else {
          i--;
          break;
        }
      }

      if (forward) {
        nextIndex--;
      }
    } else if (currentMatchIndex > currentIndex) {
      nodes[i].setAttribute('data-mce-index', String(currentMatchIndex - 1));
    }
  }

  currentSearchState.set({
    ...searchState,
    count: all ? 0 : searchState.count - 1,
    index: nextIndex
  });

  if (forward) {
    next(editor, currentSearchState);
  } else {
    prev(editor, currentSearchState);
  }

  return !all && currentSearchState.get().count > 0;
};

const done = function (editor: Editor, currentSearchState: Cell<SearchState>, keepEditorSelection?: boolean) {
  let i, nodes, startContainer, endContainer;
  const searchState = currentSearchState.get();

  nodes = Tools.toArray(editor.getBody().getElementsByTagName('span'));
  for (i = 0; i < nodes.length; i++) {
    const nodeIndex = getElmIndex(nodes[i]);

    if (nodeIndex !== null && nodeIndex.length) {
      if (nodeIndex === searchState.index.toString()) {
        if (!startContainer) {
          startContainer = nodes[i].firstChild;
        }

        endContainer = nodes[i].firstChild;
      }

      unwrap(nodes[i]);
    }
  }

  // Reset the search state
  currentSearchState.set({
    ...searchState,
    index: -1,
    count: 0,
    text: ''
  });

  if (startContainer && endContainer) {
    const rng = editor.dom.createRng();
    rng.setStart(startContainer, 0);
    rng.setEnd(endContainer, endContainer.data.length);

    if (keepEditorSelection !== false) {
      editor.selection.setRng(rng);
    }

    return rng;
  }
};

const hasNext = (editor: Editor, currentSearchState: Cell<SearchState>) => currentSearchState.get().count > 1;
const hasPrev = (editor: Editor, currentSearchState: Cell<SearchState>) => currentSearchState.get().count > 1;

export {
  done,
  find,
  next,
  prev,
  replace,
  hasNext,
  hasPrev
};
