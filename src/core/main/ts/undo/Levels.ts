/**
 * Levels.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import TrimHtml from '../dom/TrimHtml';
import Fragments from './Fragments';
import { Bookmark } from 'tinymce/core/dom/GetBookmark';
import { Editor } from 'tinymce/core/api/Editor';

export const enum UndoLevelType {
  Fragmented = 'fragmented',
  Complete = 'complete'
}

export interface UndoLevel {
  type: UndoLevelType;
  fragments: string[];
  content: string;
  bookmark: Bookmark;
  beforeBookmark: Bookmark;
}

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
  if (level.type === 'fragmented') {
    Fragments.write(level.fragments, editor.getBody());
  } else {
    editor.setContent(level.content, { format: 'raw' });
  }

  editor.selection.moveToBookmark(before ? level.beforeBookmark : level.bookmark);
};

const getLevelContent = function (level: UndoLevel): string {
  return level.type === UndoLevelType.Fragmented ? level.fragments.join('') : level.content;
};

const isEq = function (level1: UndoLevel, level2: UndoLevel): boolean {
  return !!level1 && !!level2 && getLevelContent(level1) === getLevelContent(level2);
};

export default {
  createFragmentedLevel,
  createCompleteLevel,
  createFromEditor,
  applyToEditor,
  isEq
};