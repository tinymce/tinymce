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
}

export interface PastePostProcessEvent {
  node: HTMLElement;
  readonly internal: boolean;
}

const firePastePreProcess = (editor: Editor, html: string, internal: boolean): EditorEvent<PastePreProcessEvent> =>
  editor.fire('PastePreProcess', { content: html, internal });

const firePastePostProcess = (editor: Editor, node: HTMLElement, internal: boolean): EditorEvent<PastePostProcessEvent> =>
  editor.fire('PastePostProcess', { node, internal });

const firePastePlainTextToggle = (editor: Editor, state: boolean): EditorEvent<{ state: boolean }> =>
  editor.fire('PastePlainTextToggle', { state });

export {
  firePastePreProcess,
  firePastePostProcess,
  firePastePlainTextToggle
};
