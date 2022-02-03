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
import { trimOrPadLeftRight } from './NbspTrim';
import { postProcessSetContent, preProcessSetContent } from './PrePostProcess';

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

const trimOrPad = (editor: Editor, value: string): string => {
  const selection = editor.selection;
  const dom = editor.dom;

  // Check for whitespace before/after value
  if (/^ | $/.test(value)) {
    return trimOrPadLeftRight(dom, selection.getRng(), value);
  } else {
    return value;
  }
};

const insertAtCaret = (editor: Editor, value: string | DetailsWithContent): void => {
  const { content, details } = processValue(value);

  preProcessSetContent(editor, { content: trimOrPad(editor, content), format: 'html', set: false, selection: true, paste: details.paste }).each((args) => {
    const insertedContent = Rtc.insertContent(editor, args.content, details);
    postProcessSetContent(editor, insertedContent, args);
    editor.addVisual();
  });
};

export { insertAtCaret };
