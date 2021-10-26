/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Strings } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

import * as Settings from '../api/Settings';

const rangeEqualsBracketOrSpace = (rangeString: string): boolean =>
  /^[(\[{ \u00a0]$/.test(rangeString);

const isTextNode = (node: Node): node is Text =>
  node.nodeType === 3;

const isElement = (node: Node): node is Element =>
  node.nodeType === 1;

const handleBracket = (editor: Editor): void =>
  parseCurrentLine(editor, -1);

const handleSpacebar = (editor: Editor): void =>
  parseCurrentLine(editor, 0);

const handleEnter = (editor: Editor): void =>
  parseCurrentLine(editor, -1);

const scopeIndex = (container: Node, index: number): number => {
  if (index < 0) {
    index = 0;
  }

  if (isTextNode(container)) {
    const len = container.data.length;

    if (index > len) {
      index = len;
    }
  }

  return index;
};

const setStart = (rng: Range, container: Node, offset: number): void => {
  if (!isElement(container) || container.hasChildNodes()) {
    rng.setStart(container, scopeIndex(container, offset));
  } else {
    rng.setStartBefore(container);
  }
};

const setEnd = (rng: Range, container: Node, offset: number): void => {
  if (!isElement(container) || container.hasChildNodes()) {
    rng.setEnd(container, scopeIndex(container, offset));
  } else {
    rng.setEndAfter(container);
  }
};

// Note: This is similar to the Polaris protocol detection, except it also handles `mailto` and any length scheme
const hasProtocol = (url: string): boolean =>
  /^([A-Za-z][A-Za-z\d.+-]*:\/\/)|mailto:/.test(url);

// A limited list of punctuation characters that might be used after a link
const isPunctuation = (char: string) =>
  /[?!,.;:]/.test(char);

const parseCurrentLine = (editor: Editor, endOffset: number): void => {
  let end, endContainer, bookmark, text, prev, len, rngText;
  const autoLinkPattern = Settings.getAutoLinkPattern(editor);
  const defaultLinkTarget = Settings.getDefaultLinkTarget(editor);

  // Never create a link when we are inside a link
  if (editor.dom.getParent(editor.selection.getNode(), 'a[href]') !== null) {
    return;
  }

  // We need at least five characters to form a URL,
  // hence, at minimum, five characters from the beginning of the line.
  const rng = editor.selection.getRng().cloneRange();
  if (rng.startOffset < 5) {
    // During testing, the caret is placed between two text nodes.
    // The previous text node contains the URL.
    prev = rng.endContainer.previousSibling;
    if (!prev) {
      if (!rng.endContainer.firstChild || !rng.endContainer.firstChild.nextSibling) {
        return;
      }

      prev = rng.endContainer.firstChild.nextSibling;
    }

    len = prev.length;
    setStart(rng, prev, len);
    setEnd(rng, prev, len);

    if (rng.endOffset < 5) {
      return;
    }

    end = rng.endOffset;
    endContainer = prev;
  } else {
    endContainer = rng.endContainer;

    // Get a text node
    if (!isTextNode(endContainer) && endContainer.firstChild) {
      while (!isTextNode(endContainer) && endContainer.firstChild) {
        endContainer = endContainer.firstChild;
      }

      // Move range to text node
      if (isTextNode(endContainer)) {
        setStart(rng, endContainer, 0);
        setEnd(rng, endContainer, endContainer.nodeValue.length);
      }
    }

    if (rng.endOffset === 1) {
      end = 2;
    } else {
      end = rng.endOffset - 1 - endOffset;
    }
  }

  const start = end;

  do {
    // Move the selection one character backwards.
    setStart(rng, endContainer, end >= 2 ? end - 2 : 0);
    setEnd(rng, endContainer, end >= 1 ? end - 1 : 0);
    end -= 1;
    rngText = rng.toString();

    // Loop until one of the following is found: a blank space, &nbsp;, bracket, (end-2) >= 0
  } while (!rangeEqualsBracketOrSpace(rngText) && (end - 2) >= 0);

  if (rangeEqualsBracketOrSpace(rng.toString())) {
    setStart(rng, endContainer, end);
    setEnd(rng, endContainer, start);
    end += 1;
  } else if (rng.startOffset === 0) {
    setStart(rng, endContainer, 0);
    setEnd(rng, endContainer, start);
  } else {
    setStart(rng, endContainer, end);
    setEnd(rng, endContainer, start);
  }

  // Exclude last . from word like "www.site.com."
  text = rng.toString();
  if (isPunctuation(text.charAt(text.length - 1))) {
    setEnd(rng, endContainer, start - 1);
  }

  text = rng.toString().trim();
  const matches = text.match(autoLinkPattern);

  const protocol = Settings.getDefaultLinkProtocol(editor);

  if (matches) {
    let url = matches[0];
    if (Strings.startsWith(url, 'www.')) {
      url = protocol + '://' + url;
    } else if (Strings.contains(url, '@') && !hasProtocol(url)) {
      url = 'mailto:' + url;
    }

    bookmark = editor.selection.getBookmark();

    editor.selection.setRng(rng);
    editor.execCommand('createlink', false, url);

    if (defaultLinkTarget !== false) {
      editor.dom.setAttrib(editor.selection.getNode(), 'target', defaultLinkTarget);
    }

    editor.selection.moveToBookmark(bookmark);
    editor.nodeChanged();
  }
};

const setup = (editor: Editor): void => {
  let autoUrlDetectState: boolean | undefined;

  editor.on('keydown', (e) => {
    if (e.keyCode === 13) {
      return handleEnter(editor);
    }
  });

  // Internet Explorer has built-in automatic linking for most cases
  if (Env.browser.isIE()) {
    editor.on('focus', () => {
      if (!autoUrlDetectState) {
        autoUrlDetectState = true;

        try {
          editor.execCommand('AutoUrlDetect', false, true);
        } catch (ex) {
          // Ignore
        }
      }
    });

    return;
  }

  editor.on('keypress', (e) => {
    // One of the closing bracket keys: ), ] or }
    if (e.keyCode === 41 || e.keyCode === 93 || e.keyCode === 125) {
      return handleBracket(editor);
    }
  });

  editor.on('keyup', (e) => {
    if (e.keyCode === 32) {
      return handleSpacebar(editor);
    }
  });
};

export {
  setup
};
