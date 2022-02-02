/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

export interface PastePreProcessEvent {
  content: string;
  readonly internal: boolean;
  readonly wordContent: boolean;
}

export interface PastePostProcessEvent {
  node: HTMLElement;
  readonly internal: boolean;
  readonly wordContent: boolean;
}

const firePastePreProcess = (editor: Editor, html: string, internal: boolean, isWordHtml: boolean): EditorEvent<PastePreProcessEvent> =>
  editor.fire('PastePreProcess', { content: html, internal, wordContent: isWordHtml });

const firePastePostProcess = (editor: Editor, node: HTMLElement, internal: boolean, isWordHtml: boolean): EditorEvent<PastePostProcessEvent> =>
  editor.fire('PastePostProcess', { node, internal, wordContent: isWordHtml });

const firePastePlainTextToggle = (editor: Editor, state: boolean): EditorEvent<{ state: boolean }> =>
  editor.fire('PastePlainTextToggle', { state });

const firePaste = (editor: Editor, ieFake: boolean): EditorEvent<ClipboardEvent> =>
  // Casting this as it only exists for IE compatibility
  editor.fire('paste', { ieFake } as any as ClipboardEvent);

export {
  firePastePreProcess,
  firePastePostProcess,
  firePastePlainTextToggle,
  firePaste
};
