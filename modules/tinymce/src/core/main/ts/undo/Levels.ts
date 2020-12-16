/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Optional } from '@ephox/katamari';
import { Html, Remove, SelectorFilter, SugarElement } from '@ephox/sugar';
import Editor from '../api/Editor';
import * as TrimHtml from '../dom/TrimHtml';
import * as Fragments from './Fragments';
import { UndoLevel, UndoLevelType } from './UndoManagerTypes';

const undoLevelDocument = Cell<Optional<Document>>(Optional.none());

// We need to create a temporary document instead of using the global document since
// innerHTML on a detached element will still make http requests to the images
const lazyTempDocument = () => undoLevelDocument.get().getOrThunk(() => {
  const doc = document.implementation.createHTMLDocument('undo');
  undoLevelDocument.set(Optional.some(doc));
  return doc;
});

const hasIframes = (html: string) => {
  return html.indexOf('</iframe>') !== -1;
};

const createFragmentedLevel = (fragments: string[]): UndoLevel => {
  return {
    type: UndoLevelType.Fragmented,
    fragments,
    content: '',
    bookmark: null,
    beforeBookmark: null
  };
};

const createCompleteLevel = (content: string): UndoLevel => {
  return {
    type: UndoLevelType.Complete,
    fragments: null,
    content,
    bookmark: null,
    beforeBookmark: null
  };
};

const createFromEditor = (editor: Editor): UndoLevel => {
  const fragments = Fragments.read(editor.getBody());
  const trimmedFragments = Arr.bind(fragments, (html) => {
    const trimmed = TrimHtml.trimInternal(editor.serializer, html);
    return trimmed.length > 0 ? [ trimmed ] : [];
  });
  const content = trimmedFragments.join('');

  return hasIframes(content) ? createFragmentedLevel(trimmedFragments) : createCompleteLevel(content);
};

const applyToEditor = (editor: Editor, level: UndoLevel, before: boolean) => {
  if (level.type === UndoLevelType.Fragmented) {
    Fragments.write(level.fragments, editor.getBody());
  } else {
    editor.setContent(level.content, { format: 'raw' });
  }

  editor.selection.moveToBookmark(before ? level.beforeBookmark : level.bookmark);
};

const getLevelContent = (level: UndoLevel): string => {
  return level.type === UndoLevelType.Fragmented ? level.fragments.join('') : level.content;
};

const getCleanLevelContent = (level: UndoLevel): string => {
  const elm = SugarElement.fromTag('body', lazyTempDocument());
  Html.set(elm, getLevelContent(level));
  Arr.each(SelectorFilter.descendants(elm, '*[data-mce-bogus]'), Remove.unwrap);
  return Html.get(elm);
};

const hasEqualContent = (level1: UndoLevel, level2: UndoLevel): boolean => getLevelContent(level1) === getLevelContent(level2);

const hasEqualCleanedContent = (level1: UndoLevel, level2: UndoLevel): boolean => getCleanLevelContent(level1) === getCleanLevelContent(level2);

// Most of the time the contents is equal so it's faster to first check that using strings then fallback to a cleaned dom comparison
const isEq = (level1: UndoLevel, level2: UndoLevel): boolean => {
  if (!level1 || !level2) {
    return false;
  } else if (hasEqualContent(level1, level2)) {
    return true;
  } else {
    return hasEqualCleanedContent(level1, level2);
  }
};

export {
  createFragmentedLevel,
  createCompleteLevel,
  createFromEditor,
  applyToEditor,
  isEq
};
