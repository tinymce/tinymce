/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const getDateFormat = (editor) => {
  return editor.getParam('insertdatetime_dateformat', editor.translate('%Y-%m-%d'));
};

const getTimeFormat = (editor) => {
  return editor.getParam('insertdatetime_timeformat', editor.translate('%H:%M:%S'));
};

const getFormats = (editor): string[] => {
  return editor.getParam('insertdatetime_formats', [ '%H:%M:%S', '%Y-%m-%d', '%I:%M:%S %p', '%D' ]);
};

const getDefaultDateTime = (editor) => {
  const formats = getFormats(editor);
  return formats.length > 0 ? formats[0] : getTimeFormat(editor);
};

const shouldInsertTimeElement = (editor) => {
  return editor.getParam('insertdatetime_element', false);
};

export {
  getDateFormat,
  getTimeFormat,
  getFormats,
  getDefaultDateTime,
  shouldInsertTimeElement
};
