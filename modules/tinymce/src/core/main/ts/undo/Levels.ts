import { Arr, Thunk, Type } from '@ephox/katamari';
import { Html, Remove, SelectorFilter, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import { isPathBookmark } from '../bookmark/BookmarkTypes';
import * as TrimHtml from '../dom/TrimHtml';
import * as Fragments from './Fragments';
import { CompleteUndoLevel, FragmentedUndoLevel, NewUndoLevel, UndoLevel, UndoLevelType } from './UndoManagerTypes';

// We need to create a temporary document instead of using the global document since
// innerHTML on a detached element will still make http requests to the images
const lazyTempDocument = Thunk.cached(() => document.implementation.createHTMLDocument('undo'));

const hasIframes = (html: string) => {
  return html.indexOf('</iframe>') !== -1;
};

const createFragmentedLevel = (fragments: string[]): FragmentedUndoLevel => {
  return {
    type: UndoLevelType.Fragmented,
    fragments,
    content: '',
    bookmark: null,
    beforeBookmark: null
  };
};

const createCompleteLevel = (content: string): CompleteUndoLevel => {
  return {
    type: UndoLevelType.Complete,
    fragments: null,
    content,
    bookmark: null,
    beforeBookmark: null
  };
};

const createFromEditor = (editor: Editor): NewUndoLevel => {
  const fragments = Fragments.read(editor.getBody());
  const trimmedFragments = Arr.bind(fragments, (html) => {
    const trimmed = TrimHtml.trimInternal(editor.serializer, html);
    return trimmed.length > 0 ? [ trimmed ] : [];
  });
  const content = trimmedFragments.join('');

  return hasIframes(content) ? createFragmentedLevel(trimmedFragments) : createCompleteLevel(content);
};

const applyToEditor = (editor: Editor, level: UndoLevel, before: boolean): void => {
  const bookmark = before ? level.beforeBookmark : level.bookmark;

  if (level.type === UndoLevelType.Fragmented) {
    Fragments.write(level.fragments, editor.getBody());
  } else {
    editor.setContent(level.content, {
      format: 'raw',
      // If we have a path bookmark, we need to check if the bookmark location was a fake caret.
      // If the bookmark was not a fake caret, then we need to ensure that setContent does not move the selection
      // as this can create a new fake caret - particularly if the first element in the body is contenteditable=false.
      // The creation of this new fake caret will cause our path offset to be off by one when restoring the original selection.
      no_selection: Type.isNonNullable(bookmark) && isPathBookmark(bookmark) ? !bookmark.isFakeCaret : true
    });
  }

  if (bookmark) {
    editor.selection.moveToBookmark(bookmark);
    editor.selection.scrollIntoView();
  }
};

const getLevelContent = (level: NewUndoLevel): string => {
  return level.type === UndoLevelType.Fragmented ? level.fragments.join('') : level.content;
};

const getCleanLevelContent = (level: NewUndoLevel): string => {
  const elm = SugarElement.fromTag('body', lazyTempDocument());
  Html.set(elm, getLevelContent(level));
  Arr.each(SelectorFilter.descendants(elm, '*[data-mce-bogus]'), Remove.unwrap);
  return Html.get(elm);
};

const hasEqualContent = (level1: NewUndoLevel, level2: NewUndoLevel): boolean =>
  getLevelContent(level1) === getLevelContent(level2);

const hasEqualCleanedContent = (level1: NewUndoLevel, level2: NewUndoLevel): boolean =>
  getCleanLevelContent(level1) === getCleanLevelContent(level2);

// Most of the time the contents is equal so it's faster to first check that using strings then fallback to a cleaned dom comparison
const isEq = (level1: NewUndoLevel | undefined, level2: NewUndoLevel | undefined): boolean => {
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
