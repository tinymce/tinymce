/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getDateFormat = getSetting('insertdatetime_dateformat', '%Y-%m-%d');

const getTimeFormat = getSetting('insertdatetime_timeformat', '%H:%M:%S');

const getFormats = getSetting('insertdatetime_formats', [ '%H:%M:%S', '%Y-%m-%d', '%I:%M:%S %p', '%D' ]);

const getDefaultDateTime = (editor: Editor) => {
  const formats = getFormats(editor);
  return formats.length > 0 ? formats[0] : getTimeFormat(editor);
};

const shouldInsertTimeElement = getSetting('insertdatetime_element', false);

export {
  getDateFormat,
  getTimeFormat,
  getFormats,
  getDefaultDateTime,
  shouldInsertTimeElement
};
