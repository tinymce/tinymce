/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const getDateFormat = function (editor) {
  return editor.getParam('insertdatetime_dateformat', editor.translate('%Y-%m-%d'));
};

const getTimeFormat = function (editor) {
  return editor.getParam('insertdatetime_timeformat', editor.translate('%H:%M:%S'));
};

const getFormats = function (editor) {
  return editor.getParam('insertdatetime_formats', ['%H:%M:%S', '%Y-%m-%d', '%I:%M:%S %p', '%D']);
};

const getDefaultDateTime = function (editor) {
  const formats = getFormats(editor);
  return formats.length > 0 ? formats[0] : getTimeFormat(editor);
};

const shouldInsertTimeElement = function (editor) {
  return editor.getParam('insertdatetime_element', false);
};

export default {
  getDateFormat,
  getTimeFormat,
  getFormats,
  getDefaultDateTime,
  shouldInsertTimeElement
};