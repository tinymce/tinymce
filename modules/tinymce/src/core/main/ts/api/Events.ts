/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AutocompleterEventArgs } from '../autocomplete/AutocompleteTypes';
import { Content, GetContentArgs, SetContentArgs } from '../content/ContentTypes';
import { FormatVars } from '../fmt/FormatTypes';
import { RangeLikeObject } from '../selection/RangeTypes';
import Editor from './Editor';
import { PastePlainTextToggleEvent, PastePostProcessEvent, PastePreProcessEvent } from './EventTypes';
import { ParserArgs } from './html/DomParser';
import { EditorEvent } from './util/EventDispatcher';

const firePreProcess = (editor: Editor, args: ParserArgs & { node: Element }) => editor.fire('PreProcess', args);

const firePostProcess = (editor: Editor, args: ParserArgs & { content: string }) => editor.fire('PostProcess', args);

const fireRemove = (editor: Editor) => editor.fire('remove');

const fireDetach = (editor: Editor) => editor.fire('detach');

const fireSwitchMode = (editor: Editor, mode: string) => editor.fire('SwitchMode', { mode });

const fireObjectResizeStart = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string) => {
  editor.fire('ObjectResizeStart', { target, width, height, origin });
};

const fireObjectResized = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string) => {
  editor.fire('ObjectResized', { target, width, height, origin });
};

const firePreInit = (editor: Editor) => editor.fire('PreInit');

const firePostRender = (editor: Editor) => editor.fire('PostRender');

const fireInit = (editor: Editor) => editor.fire('Init');

const firePlaceholderToggle = (editor: Editor, state: boolean) => editor.fire('PlaceholderToggle', { state });

const fireError = (editor: Editor, errorType: string, error: { message: string }) => editor.fire(errorType, error);

const fireFormatApply = (editor: Editor, format: string, node: Node | RangeLikeObject, vars: FormatVars | undefined) =>
  editor.fire('FormatApply', { format, node, vars });

const fireFormatRemove = (editor: Editor, format: string, node: Node | RangeLikeObject, vars: FormatVars | undefined) =>
  editor.fire('FormatRemove', { format, node, vars });

const fireBeforeSetContent = <T extends SetContentArgs>(editor: Editor, args: T) =>
  editor.fire('BeforeSetContent', args);

const fireSetContent = <T extends SetContentArgs>(editor: Editor, args: T) =>
  editor.fire('SetContent', args);

const fireBeforeGetContent = <T extends GetContentArgs>(editor: Editor, args: T) =>
  editor.fire('BeforeGetContent', args);

const fireGetContent = <T extends GetContentArgs & { content: Content }>(editor: Editor, args: T) =>
  editor.fire('GetContent', args);

const fireAutocompleterStart = (editor: Editor, args: AutocompleterEventArgs) => editor.fire('AutocompleterStart', args);

const fireAutocompleterUpdate = (editor: Editor, args: AutocompleterEventArgs) => editor.fire('AutocompleterUpdate', args);

const fireAutocompleterEnd = (editor: Editor) => editor.fire('AutocompleterEnd');

const firePastePreProcess = (editor: Editor, html: string, internal: boolean): EditorEvent<PastePreProcessEvent> =>
  editor.fire('PastePreProcess', { content: html, internal });

const firePastePostProcess = (editor: Editor, node: HTMLElement, internal: boolean): EditorEvent<PastePostProcessEvent> =>
  editor.fire('PastePostProcess', { node, internal });

const firePastePlainTextToggle = (editor: Editor, state: boolean): EditorEvent<PastePlainTextToggleEvent> =>
  editor.fire('PastePlainTextToggle', { state });

export {
  firePreProcess,
  firePostProcess,
  fireRemove,
  fireDetach,
  fireSwitchMode,
  fireObjectResizeStart,
  fireObjectResized,
  firePreInit,
  firePostRender,
  fireInit,
  firePlaceholderToggle,
  fireError,
  fireFormatApply,
  fireFormatRemove,
  fireBeforeSetContent,
  fireSetContent,
  fireBeforeGetContent,
  fireGetContent,
  fireAutocompleterStart,
  fireAutocompleterUpdate,
  fireAutocompleterEnd,
  firePastePlainTextToggle,
  firePastePostProcess,
  firePastePreProcess
};
