/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Node } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import FindReplaceText from './FindReplaceText';

export interface SearchState {
  index: number;
  count: number;
  text: string;
  matchCase: boolean;
  wholeWord: boolean;
}

// Copied from UnicodeData in polaris, as it's not exported. Maybe it should be?
const punctuationCharsRe = '[!-#%-*,-\\/:;?@\\[-\\]_{}\u00A1\u00AB\u00B7\u00BB\u00BF;\u00B7\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1361-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u3008\u3009\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30\u2E31\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]';

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

  return FindReplaceText.findAndReplaceDOMText(regex, node, marker, 1, editor.schema);
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

const escapeSearchText = (text: string, wholeWord: boolean) => {
  const escapedText = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&').replace(/\s/g, '[^\\S\\r\\n]');
  const wordRegex = '(' + escapedText + ')';
  return wholeWord ? `(?:^|\\s|${punctuationCharsRe})` + wordRegex + `(?=$|\\s|${punctuationCharsRe})` : wordRegex;
};

const find = function (editor: Editor, currentSearchState: Cell<SearchState>, text: string, matchCase: boolean, wholeWord: boolean) {
  const escapedText = escapeSearchText(text, wholeWord);

  const count = markAllMatches(editor, currentSearchState, new RegExp(escapedText, matchCase ? 'g' : 'gi'));

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
