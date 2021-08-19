/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { GetContentArgs, SetContentArgs } from '../content/ContentTypes';
import { FormatVars } from '../fmt/FormatTypes';
import { RangeLikeObject } from '../selection/RangeTypes';
import { UndoLevel } from '../undo/UndoManagerTypes';
import Editor from './Editor';
import { ParserArgs } from './html/DomParser';
import { Dialog } from './ui/Ui';
import { NativeEventMap } from './util/EventDispatcher';
import { InstanceApi } from './WindowManager';

export interface ExecCommandEvent { command: string; ui?: boolean; value?: any }

// TODO Figure out if these properties should be on the ContentArgs types
export type GetContentEvent = GetContentArgs & { source_view?: boolean; selection?: boolean; save?: boolean };
export type SetContentEvent = SetContentArgs & { source_view?: boolean; paste?: boolean; selection?: boolean };

export interface NewBlockEvent { newBlock: Element }

export interface NodeChangeEvent { element: Element; parents: Node[]; selectionChange?: boolean; initial?: boolean }

export interface FormatEvent { format: string; vars?: FormatVars; node?: Node | RangeLikeObject }

export interface ObjectResizeEvent { target: HTMLElement; width: number; height: number; origin: string }

export interface ObjectSelectedEvent { target: Node; targetClone?: Node }

export interface ScrollIntoViewEvent { elm: HTMLElement; alignToTop: boolean }

export interface SetSelectionRangeEvent { range: Range; forward: boolean }

export interface ShowCaretEvent { target: Node; direction: number; before: boolean }

export interface SwitchModeEvent { mode: string }

export interface AddUndoEvent { level: UndoLevel; lastLevel: UndoLevel; originalEvent: Event }
export interface UndoRedoEvent { level: UndoLevel }

export interface WindowEvent<T extends Dialog.DialogData> { dialog: InstanceApi<T> }

export interface ProgressStateEvent { state: boolean; time?: number }

export interface AfterProgressStateEvent { state: boolean }

export interface PlaceholderToggleEvent { state: boolean }

export interface LoadErrorEvent { message: string }

export interface PreProcessEvent extends ParserArgs { node: Element }
export interface PostProcessEvent extends ParserArgs { content: string }

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
  'ObjectResized': ObjectResizeEvent;
  'ObjectResizeStart': ObjectResizeEvent;
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
  'FormatApply': FormatEvent;
  'FormatRemove': FormatEvent;
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
  'AfterProgressState': AfterProgressStateEvent;
  'PlaceholderToggle': PlaceholderToggleEvent;
  'tap': TouchEvent;
  'longpress': TouchEvent;
  'longpresscancel': { };
  'PreProcess': PreProcessEvent;
  'PostProcess': PostProcessEvent;
}

export interface EditorManagerEventMap {
  'AddEditor': { editor: Editor };
  'RemoveEditor': { editor: Editor };
  'BeforeUnload': { returnValue: any };
}
