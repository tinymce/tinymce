/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Element, Event, FocusEvent, HTMLElement, Node, Range, TouchEvent, UIEvent } from '@ephox/dom-globals';
import { GetContentArgs } from '../content/GetContent';
import { SetContentArgs } from '../content/SetContent';
import { UndoLevel } from '../undo/UndoManagerTypes';
import Editor from './Editor';
import { NativeEventMap } from './util/EventDispatcher';

export interface ExecCommandEvent { command: string; ui?: boolean; value?: any }

// TODO Figure out if these properties should be on the ContentArgs types
export type GetContentEvent = GetContentArgs & { source_view: boolean; selection: boolean; save: boolean };
export type SetContentEvent = SetContentArgs & { paste: boolean; selection: boolean };

export interface NewBlockEvent { newBlock: Element }

export interface NodeChangedEvent { element: Element; parents: Node[]; selectionChange?: boolean; initial?: boolean }

export interface ObjectResizedEvent { target: HTMLElement; width: number; height: number }

export interface ObjectSelectedEvent { target: Node; targetClone?: Node }

export interface ScrollIntoViewEvent { elm: HTMLElement; alignToTop: boolean }

export interface SetSelectionRangeEvent { range: Range; forward: boolean }

export interface ShowCaretEvent { target: Node; direction: number; before: boolean }

export interface SwitchModeEvent { mode: string }

export interface AddUndoEvent { level: UndoLevel; lastLevel: UndoLevel; originalEvent: Event }
export interface UndoRedoEvent { level: UndoLevel }

export interface WindowEvent<T extends Types.Dialog.DialogData> { dialog: Types.Dialog.DialogInstanceApi<T> }

export interface ProgressStateEvent { state: boolean; time?: number }

export interface PlaceholderToggleEvent { state: boolean }

export interface LoadErrorEvent { message: string }

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
