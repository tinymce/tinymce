/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import Tools from '../api/util/Tools';
import * as Rtc from '../Rtc';
import { InsertContentDetails } from './ContentTypes';

interface DetailsWithContent extends InsertContentDetails {
  readonly content: string;
}

interface ProcessedValue {
  readonly content: string;
  readonly details: InsertContentDetails;
}

const processValue = (value: string | DetailsWithContent): ProcessedValue => {
  if (typeof value !== 'string') {
    const details = Tools.extend({
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

const insertAtCaret = (editor: Editor, value: string | DetailsWithContent): void => {
  const result = processValue(value);

  Rtc.insertContent(editor, result.content, result.details);
};

export { insertAtCaret };
