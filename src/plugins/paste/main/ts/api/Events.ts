/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';
import { HTMLElement } from '@ephox/dom-globals';

const firePastePreProcess = function (editor: Editor, html: string, internal: boolean, isWordHtml: boolean) {
  return editor.fire('PastePreProcess', { content: html, internal, wordContent: isWordHtml });
};

const firePastePostProcess = function (editor: Editor, node: HTMLElement, internal: boolean, isWordHtml: boolean) {
  return editor.fire('PastePostProcess', { node, internal, wordContent: isWordHtml });
};

const firePastePlainTextToggle = function (editor: Editor, state: boolean) {
  return editor.fire('PastePlainTextToggle', { state });
};

const firePaste = function (editor: Editor, ieFake: boolean) {
  return editor.fire('paste', { ieFake });
};

export default {
  firePastePreProcess,
  firePastePostProcess,
  firePastePlainTextToggle,
  firePaste
};