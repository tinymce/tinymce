/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getDateFormat = (editor: Editor): string =>
  editor.getParam('insertdatetime_dateformat', editor.translate('%Y-%m-%d'));

const getTimeFormat = (editor: Editor): string =>
  editor.getParam('insertdatetime_timeformat', editor.translate('%H:%M:%S'));

const getFormats = (editor: Editor): string[] =>
  editor.getParam('insertdatetime_formats', [ '%H:%M:%S', '%Y-%m-%d', '%I:%M:%S %p', '%D' ]);

const getDefaultDateTime = (editor: Editor): string => {
  const formats = getFormats(editor);
  return formats.length > 0 ? formats[0] : getTimeFormat(editor);
};

const shouldInsertTimeElement = (editor: Editor): boolean =>
  editor.getParam('insertdatetime_element', false);

export {
  getDateFormat,
  getTimeFormat,
  getFormats,
  getDefaultDateTime,
  shouldInsertTimeElement
};
