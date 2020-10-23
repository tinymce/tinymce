/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import Tools from '../api/util/Tools';
import * as Rtc from '../Rtc';

const processValue = function (value) {
  let details;

  if (typeof value !== 'string') {
    details = Tools.extend({
      paste: value.paste,
      data: {
        paste: value.paste
      }
    }, value);

    return {
      content: value.content,
      details
    };
  }

  return {
    content: value,
    details: {}
  };
};

const insertAtCaret = function (editor: Editor, value) {
  const result = processValue(value);

  Rtc.insertContent(editor, result.content, result.details);
};

export { insertAtCaret };
