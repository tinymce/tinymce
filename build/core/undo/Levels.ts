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

/**
 * This module handles getting/setting undo levels to/from editor instances.
 *
 * @class tinymce.undo.Levels
 * @private
 */

const hasIframes = function (html) {
  return html.indexOf('</iframe>') !== -1;
};

const createFragmentedLevel = function (fragments) {
  return {
    type: 'fragmented',
    fragments,
    content: '',
    bookmark: null,
    beforeBookmark: null
  };
};

const createCompleteLevel = function (content) {
  return {
    type: 'complete',
    fragments: null,
    content,
    bookmark: null,
    beforeBookmark: null
  };
};

const createFromEditor = function (editor) {
  let fragments, content, trimmedFragments;

  fragments = Fragments.read(editor.getBody());
  trimmedFragments = Arr.bind(fragments, function (html) {
    const trimmed = TrimHtml.trimInternal(editor.serializer, html);
    return trimmed.length > 0 ? [trimmed] : [];
  });
  content = trimmedFragments.join('');

  return hasIframes(content) ? createFragmentedLevel(trimmedFragments) : createCompleteLevel(content);
};

const applyToEditor = function (editor, level, before) {
  if (level.type === 'fragmented') {
    Fragments.write(level.fragments, editor.getBody());
  } else {
    editor.setContent(level.content, { format: 'raw' });
  }

  editor.selection.moveToBookmark(before ? level.beforeBookmark : level.bookmark);
};

const getLevelContent = function (level) {
  return level.type === 'fragmented' ? level.fragments.join('') : level.content;
};

const isEq = function (level1, level2) {
  return !!level1 && !!level2 && getLevelContent(level1) === getLevelContent(level2);
};

export default {
  createFragmentedLevel,
  createCompleteLevel,
  createFromEditor,
  applyToEditor,
  isEq
};