import { AutocompleterEventArgs } from '../autocomplete/AutocompleteTypes';
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

export interface BeforeGetContentEvent extends GetContentArgs {
  selection?: boolean;
}

export interface GetContentEvent extends BeforeGetContentEvent {
  content: string;
}

export interface BeforeSetContentEvent extends SetContentArgs {
  content: string;
  selection?: boolean;
}

export interface SetContentEvent extends BeforeSetContentEvent {
  /** @deprecated */
  content: string;
}

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

export interface PastePlainTextToggleEvent { state: boolean }
export interface PastePreProcessEvent {
  content: string;
  readonly internal: boolean;
}

export interface PastePostProcessEvent {
  node: HTMLElement;
  readonly internal: boolean;
}

export interface NewTableRowEvent { node: HTMLTableRowElement }
export interface NewTableCellEvent { node: HTMLTableCellElement }

export interface TableEventData {
  readonly structure: boolean;
  readonly style: boolean;
}
export interface TableModifiedEvent extends TableEventData {
  readonly table: HTMLTableElement;
}

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
  'ModelLoadError': LoadErrorEvent;
  'IconsLoadError': LoadErrorEvent;
  'ThemeLoadError': LoadErrorEvent;
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
  'BeforeGetContent': BeforeGetContentEvent;
  'GetContent': GetContentEvent;
  'BeforeSetContent': BeforeSetContentEvent;
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
  'AutocompleterStart': AutocompleterEventArgs;
  'AutocompleterUpdate': AutocompleterEventArgs;
  'AutocompleterEnd': { };
  'PastePlainTextToggle': PastePlainTextToggleEvent;
  'PastePreProcess': PastePreProcessEvent;
  'PastePostProcess': PastePostProcessEvent;
  'TableModified': TableModifiedEvent;
  'NewRow': NewTableRowEvent;
  'NewCell': NewTableCellEvent;
}

export interface EditorManagerEventMap {
  'AddEditor': { editor: Editor };
  'RemoveEditor': { editor: Editor };
  'BeforeUnload': { returnValue: any };
}
