/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Element, Event, HTMLElement, Node, Range, TouchEvent, UIEvent } from '@ephox/dom-globals';
import { GetContentArgs, SetContentArgs } from '../content/ContentTypes';
import { UndoLevel } from '../undo/UndoManagerTypes';
import Editor from './Editor';
import { NativeEventMap } from './util/EventDispatcher';

export type ExecCommandEvent = { command: string; ui?: boolean; value?: any };

// TODO Figure out if these properties should be on the ContentArgs types
export type GetContentEvent = GetContentArgs & { source_view: boolean; selection: boolean; save: boolean };
export type SetContentEvent = SetContentArgs & { paste: boolean; selection: boolean };

export type NewBlockEvent = { newBlock: Element };

export type NodeChangeEvent = { element: Element; parents: Node[]; selectionChange?: boolean; initial?: boolean };

export type ObjectResizedEvent = { target: HTMLElement; width: number; height: number };

export type ObjectSelectedEvent = { target: Node; targetClone?: Node };

export type ScrollIntoViewEvent = { elm: HTMLElement; alignToTop: boolean };

export type SetSelectionRangeEvent = { range: Range; forward: boolean };

export type ShowCaretEvent = { target: Node; direction: number; before: boolean };

export type SwitchModeEvent = { mode: string };

export type AddUndoEvent = { level: UndoLevel; lastLevel: UndoLevel; originalEvent: Event };
export type UndoRedoEvent = { level: UndoLevel };

export type WindowEvent<T extends Types.Dialog.DialogData> = { dialog: Types.Dialog.DialogInstanceApi<T> };

export type ProgressStateEvent = { state: boolean; time?: number };

export type PlaceholderToggleEvent = { state: boolean };

export type LoadErrorEvent = { message: string };

export interface EditorEventMap extends Omit<NativeEventMap, 'blur' | 'focus'> {
  'activate': { relatedTarget: Editor };
  'deactivate': { relatedTarget: Editor };
  'focus': { blurredEditor: Editor };
  'blur': { focusedEditor: Editor };
  'resize': UIEvent;
  'scroll': UIEvent;
  'detach': { };
  'remove': { };
  'init': { };
  'ScrollIntoView': ScrollIntoViewEvent;
  'AfterScrollIntoView': ScrollIntoViewEvent;
  'ObjectResized': ObjectResizedEvent;
  'ObjectResizeStart': ObjectResizedEvent;
  'SwitchMode': SwitchModeEvent;
  'ScrollWindow': UIEvent;
  'ResizeWindow': UIEvent;
  'SkinLoaded': { };
  'SkinLoadError': LoadErrorEvent;
  'PluginLoadError': LoadErrorEvent;
  'IconsLoadError': LoadErrorEvent;
  'LanguageLoadError': LoadErrorEvent;
  'BeforeExecCommand': ExecCommandEvent;
  'ExecCommand': ExecCommandEvent;
  'NodeChange': NodeChangeEvent;
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
  'PlaceholderToggle': PlaceholderToggleEvent;
  'tap': TouchEvent;
  'longpress': TouchEvent;
  'longpresscancel': { };
}

export interface EditorManagerEventMap extends NativeEventMap {
  'AddEditor': { editor: Editor };
  'RemoveEditor': { editor: Editor };
  'BeforeUnload': { returnValue: any };
}
