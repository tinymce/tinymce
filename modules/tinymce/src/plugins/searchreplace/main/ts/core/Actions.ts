import { Cell } from '@ephox/katamari';
import { Pattern as PolarisPattern } from '@ephox/polaris';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Tools from 'tinymce/core/api/util/Tools';

import * as FindMark from './FindMark';
import { Pattern } from './Types';

export interface SearchState {
  readonly index: number;
  readonly count: number;
  readonly text: string;
  readonly matchCase: boolean;
  readonly wholeWord: boolean;
  readonly inSelection: boolean;
}

const getElmIndex = (elm: Element): string | null => {
  return elm.getAttribute('data-mce-index');
};

const markAllMatches = (editor: Editor, currentSearchState: Cell<SearchState>, pattern: Pattern, inSelection: boolean): number => {
  const marker = editor.dom.create('span', {
    'data-mce-bogus': 1
  });

  marker.className = 'mce-match-marker';
  const node = editor.getBody();

  done(editor, currentSearchState, false);

  if (inSelection) {
    return FindMark.findAndMarkInSelection(editor.dom, pattern, editor.selection, marker);
  } else {
    return FindMark.findAndMark(editor.dom, pattern, node, marker);
  }
};

const unwrap = (node: Node): void => {
  const parentNode = node.parentNode as Node;

  if (node.firstChild) {
    parentNode.insertBefore(node.firstChild, node);
  }

  node.parentNode?.removeChild(node);
};

const findSpansByIndex = (editor: Editor, index: number): HTMLSpanElement[] => {
  const spans: HTMLSpanElement[] = [];

  const nodes = Tools.toArray(editor.getBody().getElementsByTagName('span'));
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

const moveSelection = (editor: Editor, currentSearchState: Cell<SearchState>, forward: boolean): number => {
  const searchState = currentSearchState.get();
  let testIndex = searchState.index;
  const dom = editor.dom;

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

const removeNode = (dom: DOMUtils, node: Node): void => {
  const parent = node.parentNode;

  dom.remove(node);

  if (parent && dom.isEmpty(parent)) {
    dom.remove(parent);
  }
};

const escapeSearchText = (text: string, wholeWord: boolean): string => {
  const escapedText = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&').replace(/\s/g, '[^\\S\\r\\n\\uFEFF]');
  const wordRegex = '(' + escapedText + ')';
  return wholeWord ? `(?:^|\\s|${PolarisPattern.punctuation()})` + wordRegex + `(?=$|\\s|${PolarisPattern.punctuation()})` : wordRegex;
};

const find = (editor: Editor, currentSearchState: Cell<SearchState>, text: string, matchCase: boolean, wholeWord: boolean, inSelection: boolean): number => {
  const selection = editor.selection;
  const escapedText = escapeSearchText(text, wholeWord);
  const isForwardSelection = selection.isForward();

  const pattern = {
    regex: new RegExp(escapedText, matchCase ? 'g' : 'gi'),
    matchIndex: 1
  };
  const count = markAllMatches(editor, currentSearchState, pattern, inSelection);

  // Safari has a bug whereby splitting text nodes breaks the selection (which is done when marking matches).
  // As such we need to manually reset it after doing a find action. See https://bugs.webkit.org/show_bug.cgi?id=230594
  if (Env.browser.isSafari()) {
    selection.setRng(selection.getRng(), isForwardSelection);
  }

  if (count) {
    const newIndex = moveSelection(editor, currentSearchState, true);
    currentSearchState.set({
      index: newIndex,
      count,
      text,
      matchCase,
      wholeWord,
      inSelection
    });
  }

  return count;
};

const next = (editor: Editor, currentSearchState: Cell<SearchState>): void => {
  const index = moveSelection(editor, currentSearchState, true);
  currentSearchState.set({ ...currentSearchState.get(), index });
};

const prev = (editor: Editor, currentSearchState: Cell<SearchState>): void => {
  const index = moveSelection(editor, currentSearchState, false);
  currentSearchState.set({ ...currentSearchState.get(), index });
};

const isMatchSpan = (node: Element): boolean => {
  const matchIndex = getElmIndex(node);

  return matchIndex !== null && matchIndex.length > 0;
};

const replace = (editor: Editor, currentSearchState: Cell<SearchState>, text: string, forward?: boolean, all?: boolean): boolean => {
  const searchState = currentSearchState.get();
  const currentIndex = searchState.index;
  let currentMatchIndex, nextIndex = currentIndex;

  forward = forward !== false;

  const node = editor.getBody();
  const nodes = Tools.grep(Tools.toArray(node.getElementsByTagName('span')), isMatchSpan);
  for (let i = 0; i < nodes.length; i++) {
    const nodeIndex = getElmIndex(nodes[i]) as string;

    let matchIndex = currentMatchIndex = parseInt(nodeIndex, 10);
    if (all || matchIndex === searchState.index) {
      if (text.length) {
        nodes[i].innerText = text;
        unwrap(nodes[i]);
      } else {
        removeNode(editor.dom, nodes[i]);
      }

      while (nodes[++i]) {
        matchIndex = parseInt(getElmIndex(nodes[i]) as string, 10);

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

const done = (editor: Editor, currentSearchState: Cell<SearchState>, keepEditorSelection?: boolean): Range | undefined => {
  let startContainer: Text | null | undefined;
  let endContainer: Text | null | undefined;
  const searchState = currentSearchState.get();

  const nodes = Tools.toArray(editor.getBody().getElementsByTagName('span'));
  for (let i = 0; i < nodes.length; i++) {
    const nodeIndex = getElmIndex(nodes[i]);

    if (nodeIndex !== null && nodeIndex.length) {
      if (nodeIndex === searchState.index.toString()) {
        // Note: The first child of the span node will be the highlighted text node
        if (!startContainer) {
          startContainer = nodes[i].firstChild as Text;
        }

        endContainer = nodes[i].firstChild as Text;
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
  } else {
    return undefined;
  }
};

const hasNext = (editor: Editor, currentSearchState: Cell<SearchState>): boolean => currentSearchState.get().count > 1;
const hasPrev = (editor: Editor, currentSearchState: Cell<SearchState>): boolean => currentSearchState.get().count > 1;

export {
  done,
  find,
  next,
  prev,
  replace,
  hasNext,
  hasPrev
};
