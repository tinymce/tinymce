/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Element, Event, FocusEvent, HTMLElement, Node, Range, UIEvent } from '@ephox/dom-globals';
import Editor from './Editor';
import { NativeEventMap } from './util/EventDispatcher';
import { GetContentArgs } from '../content/GetContent';
import { SetContentArgs } from '../content/SetContent';
import { UndoLevel } from '../undo/Levels';

export type ExecCommandEvent = { command: string, ui?: boolean, value?: any };

// TODO Figure out if these properties should be on the ContentArgs types
export type GetContentEvent = GetContentArgs & { source_view: boolean, selection: boolean, save: boolean };
export type SetContentEvent = SetContentArgs & { paste: boolean, selection: boolean };

export type NewBlockEvent = { newBlock: Element };

export type NodeChangedEvent = { element: Element, parents: Node[] };

export type ObjectResizedEvent = { target: HTMLElement, width: number, height: number };

export type ObjectSelectedEvent = { target: Node, targetClone?: Node };

export type ScrollIntoViewEvent = { elm: HTMLElement, scrollToTop: boolean };

export type SetSelectionRangeEvent = { range: Range, forward: boolean };

export type ShowCaretEvent = { target: Node, direction: number, before: boolean };

export type SwitchModeEvent = { mode: string };

export type AddUndoEvent = { level: UndoLevel, lastLevel: UndoLevel, originalEvent: Event };
export type UndoRedoEvent = { level: UndoLevel };

export type WindowEvent<T extends Types.Dialog.DialogData> = { dialog: Types.Dialog.DialogInstanceApi<T> };

export type ProgressStateEvent = { state: boolean, time?: number };

export interface EditorEventMap extends NativeEventMap {
  'activate': { relatedTarget: Editor };
  'deactivate': { relatedTarget: Editor };
  'focus': FocusEvent & { blurredEditor?: Editor };
  'blur': FocusEvent & { focusedEditor?: Editor };
  'resize': UIEvent;
  'scroll': UIEvent;
  'detach': { };
  'remove': { };
  'init': { };
  'ScrollIntoView': ScrollIntoViewEvent;
  'ObjectResized': ObjectResizedEvent;
  'ObjectResizeStart': ObjectResizedEvent;
  'SwitchMode': SwitchModeEvent;
  'ScrollWindow': UIEvent;
  'ResizeWindow': UIEvent;
  'SkinLoaded': { };
  'BeforeExecCommand': ExecCommandEvent;
  'ExecCommand': ExecCommandEvent;
  'NodeChange': NodeChangedEvent;
  'ShowCaret': ShowCaretEvent;
  'SelectionChange': { };
  'ObjectSelected': ObjectSelectedEvent;
  'BeforeObjectSelected': ObjectSelectedEvent;
  'GetSelectionRange': { range: Range };
  'SetSelectionRange': SetSelectionRangeEvent;
  'AfterSetSelectionRange': SetSelectionRangeEvent;
  'BeforeGetContent': GetContentEvent;
  'GetContent': GetContentEvent;
  'BeforeSetContent': SetContentEvent;
  'SetContent': SetContentEvent;
  'LoadContent': { };
  'PreviewFormats': { };
  'AfterPreviewFormats': { };
  'ScriptsLoaded': { };
  'PreInit': { };
  'PostRender': { };
  'NewBlock': NewBlockEvent;
  'ClearUndos': { };
  'TypingUndo': { };
  'Redo': UndoRedoEvent;
  'Undo': UndoRedoEvent;
  'BeforeAddUndo': AddUndoEvent;
  'AddUndo': AddUndoEvent;
  'CloseWindow': WindowEvent<any>;
  'OpenWindow': WindowEvent<any>;
  'ProgressState': ProgressStateEvent;
}

export interface EditorManagerEventMap extends NativeEventMap {
  'AddEditor': { editor: Editor };
  'RemoveEditor': { editor: Editor };
  'BeforeUnload': { returnValue: any };
}
