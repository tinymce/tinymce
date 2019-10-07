/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Document, document } from '@ephox/dom-globals';
import { Arr, Cell, Option } from '@ephox/katamari';
import { Element, Html, Remove, SelectorFilter } from '@ephox/sugar';
import Editor from '../api/Editor';
import TrimHtml from '../dom/TrimHtml';
import Fragments from './Fragments';
import { UndoLevel, UndoLevelType } from './UndoManagerTypes';

const undoLevelDocument = Cell<Option<Document>>(Option.none());

// We need to create a temporary document instead of using the global document since
// innerHTML on a detached element will still make http requests to the images
const lazyTempDocument = () => {
  return undoLevelDocument.get().getOrThunk(() => {
    const doc = document.implementation.createHTMLDocument('undo');
    undoLevelDocument.set(Option.some(doc));
    return doc;
  });
};

const hasIframes = function (html: string) {
  return html.indexOf('</iframe>') !== -1;
};

const createFragmentedLevel = function (fragments: string[]): UndoLevel {
  return {
    type: UndoLevelType.Fragmented,
    fragments,
    content: '',
    bookmark: null,
    beforeBookmark: null
  };
};

const createCompleteLevel = function (content: string): UndoLevel {
  return {
    type: UndoLevelType.Complete,
    fragments: null,
    content,
    bookmark: null,
    beforeBookmark: null
  };
};

const createFromEditor = function (editor: Editor): UndoLevel {
  let fragments, content, trimmedFragments;

  fragments = Fragments.read(editor.getBody());
  trimmedFragments = Arr.bind(fragments, function (html) {
    const trimmed = TrimHtml.trimInternal(editor.serializer, html);
    return trimmed.length > 0 ? [trimmed] : [];
  });
  content = trimmedFragments.join('');

  return hasIframes(content) ? createFragmentedLevel(trimmedFragments) : createCompleteLevel(content);
};

const applyToEditor = function (editor: Editor, level: UndoLevel, before: boolean) {
  if (level.type === UndoLevelType.Fragmented) {
    Fragments.write(level.fragments, editor.getBody());
  } else {
    editor.setContent(level.content, { format: 'raw' });
  }

  editor.selection.moveToBookmark(before ? level.beforeBookmark : level.bookmark);
};

const getLevelContent = function (level: UndoLevel): string {
  return level.type === UndoLevelType.Fragmented ? level.fragments.join('') : level.content;
};

const getCleanLevelContent = (level: UndoLevel): string => {
  const elm = Element.fromTag('body', lazyTempDocument());
  Html.set(elm, getLevelContent(level));
  Arr.each(SelectorFilter.descendants(elm, '*[data-mce-bogus]'), Remove.unwrap);
  return Html.get(elm);
};

const hasEqualContent = (level1: UndoLevel, level2: UndoLevel): boolean => {
  return getLevelContent(level1) === getLevelContent(level2);
};

const hasEqualCleanedContent = (level1: UndoLevel, level2: UndoLevel): boolean => {
  return getCleanLevelContent(level1) === getCleanLevelContent(level2);
};

// Most of the time the contents is equal so it's faster to first check that using strings then fallback to a cleaned dom comparison
const isEq = function (level1: UndoLevel, level2: UndoLevel): boolean {
  if (!level1 || !level2) {
    return false;
  } else if (hasEqualContent(level1, level2)) {
    return true;
  } else {
    return hasEqualCleanedContent(level1, level2);
  }
};

export default {
  createFragmentedLevel,
  createCompleteLevel,
  createFromEditor,
  applyToEditor,
  isEq
};
