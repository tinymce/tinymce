/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const firePastePreProcess = (editor: Editor, html: string, internal: boolean, isWordHtml: boolean) => {
  return editor.fire('PastePreProcess', { content: html, internal, wordContent: isWordHtml });
};

const firePastePostProcess = (editor: Editor, node: HTMLElement, internal: boolean, isWordHtml: boolean) => {
  return editor.fire('PastePostProcess', { node, internal, wordContent: isWordHtml });
};

const firePastePlainTextToggle = (editor: Editor, state: boolean) => {
  return editor.fire('PastePlainTextToggle', { state });
};

const firePaste = (editor: Editor, ieFake: boolean) => {
  // Casting this as it only exists for IE compatibility
  return editor.fire('paste', { ieFake } as any as ClipboardEvent);
};

export {
  firePastePreProcess,
  firePastePostProcess,
  firePastePlainTextToggle,
  firePaste
};
