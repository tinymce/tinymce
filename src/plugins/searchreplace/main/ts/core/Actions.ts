/**
 * Actions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import FindReplaceText from './FindReplaceText';

const getElmIndex = function (elm) {
  const value = elm.getAttribute('data-mce-index');

  if (typeof value === 'number') {
    return '' + value;
  }

  return value;
};

const markAllMatches = function (editor, currentIndexState, regex) {
  let node, marker;

  marker = editor.dom.create('span', {
    'data-mce-bogus': 1
  });

  marker.className = 'mce-match-marker'; // IE 7 adds class="mce-match-marker" and class=mce-match-marker
  node = editor.getBody();

  done(editor, currentIndexState, false);

  return FindReplaceText.findAndReplaceDOMText(regex, node, marker, false, editor.schema);
};

const unwrap = function (node) {
  const parentNode = node.parentNode;

  if (node.firstChild) {
    parentNode.insertBefore(node.firstChild, node);
  }

  node.parentNode.removeChild(node);
};

const findSpansByIndex = function (editor, index) {
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

const moveSelection = function (editor, currentIndexState, forward) {
  let testIndex = currentIndexState.get();
  const dom = editor.dom;

  forward = forward !== false;

  if (forward) {
    testIndex++;
  } else {
    testIndex--;
  }

  dom.removeClass(findSpansByIndex(editor, currentIndexState.get()), 'mce-match-marker-selected');

  const spans = findSpansByIndex(editor, testIndex);
  if (spans.length) {
    dom.addClass(findSpansByIndex(editor, testIndex), 'mce-match-marker-selected');
    editor.selection.scrollIntoView(spans[0]);
    return testIndex;
  }

  return -1;
};

const removeNode = function (dom, node) {
  const parent = node.parentNode;

  dom.remove(node);

  if (dom.isEmpty(parent)) {
    dom.remove(parent);
  }
};

const find = function (editor, currentIndexState, text, matchCase, wholeWord) {
  text = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  text = text.replace(/\s/g, '\\s');
  text = wholeWord ? '\\b' + text + '\\b' : text;

  const count = markAllMatches(editor, currentIndexState, new RegExp(text, matchCase ? 'g' : 'gi'));

  if (count) {
    currentIndexState.set(-1);
    currentIndexState.set(moveSelection(editor, currentIndexState, true));
  }

  return count;
};

const next = function (editor, currentIndexState) {
  const index = moveSelection(editor, currentIndexState, true);

  if (index !== -1) {
    currentIndexState.set(index);
  }
};

const prev = function (editor, currentIndexState) {
  const index = moveSelection(editor, currentIndexState, false);

  if (index !== -1) {
    currentIndexState.set(index);
  }
};

const isMatchSpan = function (node) {
  const matchIndex = getElmIndex(node);

  return matchIndex !== null && matchIndex.length > 0;
};

const replace = function (editor, currentIndexState, text, forward?, all?, style?) {
  let i, nodes, node, matchIndex, currentMatchIndex, nextIndex = currentIndexState.get(), hasMore;

  forward = forward !== false;

  node = editor.getBody();
  nodes = Tools.grep(Tools.toArray(node.getElementsByTagName('span')), isMatchSpan);
  for (i = 0; i < nodes.length; i++) {
    const nodeIndex = getElmIndex(nodes[i]);

    matchIndex = currentMatchIndex = parseInt(nodeIndex, 10);
    if (all || matchIndex === currentIndexState.get()) {
      if (text.length) {
        if (style && style !== 'none') {
          const st = style.split('#');
          editor.formatter[st[0] === 'a' ? 'apply' : 'remove'](st[1], undefined, nodes[i]);
        }
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
    } else if (currentMatchIndex > currentIndexState.get()) {
      nodes[i].setAttribute('data-mce-index', currentMatchIndex - 1);
    }
  }

  currentIndexState.set(nextIndex);

  if (forward) {
    hasMore = hasNext(editor, currentIndexState);
    next(editor, currentIndexState);
  } else {
    hasMore = hasPrev(editor, currentIndexState);
    prev(editor, currentIndexState);
  }

  return !all && hasMore;
};

const done = function (editor, currentIndexState, keepEditorSelection?) {
  let i, nodes, startContainer, endContainer;

  nodes = Tools.toArray(editor.getBody().getElementsByTagName('span'));
  for (i = 0; i < nodes.length; i++) {
    const nodeIndex = getElmIndex(nodes[i]);

    if (nodeIndex !== null && nodeIndex.length) {
      if (nodeIndex === currentIndexState.get().toString()) {
        if (!startContainer) {
          startContainer = nodes[i].firstChild;
        }

        endContainer = nodes[i].firstChild;
      }

      unwrap(nodes[i]);
    }
  }

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

const hasNext = function (editor, currentIndexState) {
  return findSpansByIndex(editor, currentIndexState.get() + 1).length > 0;
};

const hasPrev = function (editor, currentIndexState) {
  return findSpansByIndex(editor, currentIndexState.get() - 1).length > 0;
};

export default {
  done,
  find,
  next,
  prev,
  replace,
  hasNext,
  hasPrev
};