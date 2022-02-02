/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import {
  ClipboardContents, getDataTransferItems, hasContentType, hasHtmlOrText, pasteHtml, pasteImageData, pasteText, registerEventsAndFilters
} from '../core/Clipboard';
import { PasteBin } from '../core/PasteBin';

export interface Clipboard {
  readonly pasteFormat: Cell<string>;
  readonly pasteHtml: (html: string, internalFlag: boolean) => void;
  readonly pasteText: (text: string) => void;
  readonly pasteImageData: (e: ClipboardEvent | DragEvent, rng: Range) => boolean;
  readonly getDataTransferItems: (dataTransfer: DataTransfer) => ClipboardContents;
  readonly hasHtmlOrText: (content: ClipboardContents) => boolean;
  readonly hasContentType: (clipboardContent: ClipboardContents, mimeType: string) => boolean;
}

export const Clipboard = (editor: Editor, pasteFormat: Cell<string>): Clipboard => {
  const pasteBin = PasteBin(editor);

  editor.on('PreInit', () => registerEventsAndFilters(editor, pasteBin, pasteFormat));

  return {
    pasteFormat,
    pasteHtml: (html: string, internalFlag: boolean) => pasteHtml(editor, html, internalFlag),
    pasteText: (text: string) => pasteText(editor, text),
    pasteImageData: (e: ClipboardEvent | DragEvent, rng: Range) => pasteImageData(editor, e, rng),
    getDataTransferItems,
    hasHtmlOrText,
    hasContentType
  };
};
