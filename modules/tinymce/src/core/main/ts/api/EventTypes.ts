import { AutocompleterEventArgs } from '../autocomplete/AutocompleteTypes';
import { GetContentArgs, SetContentArgs } from '../content/ContentTypes';
import { FormatVars } from '../fmt/FormatTypes';
import { RangeLikeObject } from '../selection/RangeTypes';
import { UndoLevel } from '../undo/UndoManagerTypes';
import { SetAttribEvent } from './dom/DOMUtils';
import Editor from './Editor';
import { ParserArgs } from './html/DomParser';
import { NotificationApi, NotificationSpec } from './NotificationManager';
import { Dialog } from './ui/Ui';
import { NativeEventMap } from './util/EventDispatcher';
import { InstanceApi } from './WindowManager';

export interface ExecCommandEvent {
  command: string;
  ui: boolean;
  value?: any;
}

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

export interface SaveContentEvent extends GetContentEvent {
  save: boolean;
}

export interface NewBlockEvent {
  newBlock: Element;
}

export interface NodeChangeEvent {
  element: Element;
  parents: Node[];
  selectionChange?: boolean;
  initial?: boolean;
}

export interface FormatEvent {
  format: string;
  vars?: FormatVars;
  node?: Node | RangeLikeObject | null;
}

export interface ObjectResizeEvent {
  target: HTMLElement;
  width: number;
  height: number;
  origin: string;
}

export interface ObjectSelectedEvent {
  target: Node;
  targetClone?: Node;
}

export interface ScrollIntoViewEvent {
  elm: HTMLElement;
  alignToTop: boolean | undefined;
}

export interface SetSelectionRangeEvent {
  range: Range;
  forward: boolean | undefined;
}

export interface ShowCaretEvent {
  target: Node;
  direction: number;
  before: boolean;
}

export interface SwitchModeEvent {
  mode: string;
}

export interface ChangeEvent {
  level: UndoLevel;
  lastLevel: UndoLevel | undefined;
}

export interface AddUndoEvent extends ChangeEvent {
  originalEvent: Event | undefined;
}

export interface UndoRedoEvent {
  level: UndoLevel;
}

export interface WindowEvent<T extends Dialog.DialogData> {
  dialog: InstanceApi<T>;
}

export interface ProgressStateEvent {
  state: boolean;
  time?: number;
}

export interface AfterProgressStateEvent {
  state: boolean;
}

export interface PlaceholderToggleEvent {
  state: boolean;
}

export interface LoadErrorEvent {
  message: string;
}

export interface PreProcessEvent extends ParserArgs {
  node: Element;
}

export interface PostProcessEvent extends ParserArgs {
  content: string;
}

export interface PastePlainTextToggleEvent {
  state: boolean;
}

export interface PastePreProcessEvent {
  content: string;
  readonly internal: boolean;
}

export interface PastePostProcessEvent {
  node: HTMLElement;
  readonly internal: boolean;
}

export interface EditableRootStateChangeEvent {
  state: boolean;
}

export interface NewTableRowEvent {
  node: HTMLTableRowElement;
}

export interface NewTableCellEvent {
  node: HTMLTableCellElement;
}

export interface TableEventData {
  readonly structure: boolean;
  readonly style: boolean;
}

export interface TableModifiedEvent extends TableEventData {
  readonly table: HTMLTableElement;
}

export interface BeforeOpenNotificationEvent {
  notification: NotificationSpec;
}

export interface OpenNotificationEvent {
  notification: NotificationApi;
}

export interface EditorEventMap extends Omit<NativeEventMap, 'blur' | 'focus'> {
  'activate': { relatedTarget: Editor | null };
  'deactivate': { relatedTarget: Editor };
  'focus': { blurredEditor: Editor | null };
  'blur': { focusedEditor: Editor | null };
  'resize': UIEvent;
  'scroll': UIEvent;
  'input': InputEvent;
  'beforeinput': InputEvent;
  'detach': { };
  'remove': { };
  'init': { };
  'ScrollIntoView': ScrollIntoViewEvent;
  'AfterScrollIntoView': ScrollIntoViewEvent;
  'ObjectResized': ObjectResizeEvent;
  'ObjectResizeStart': ObjectResizeEvent;
  'SwitchMode': SwitchModeEvent;
  'ScrollWindow': Event;
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
  'SaveContent': SaveContentEvent;
  'RawSaveContent': SaveContentEvent;
  'LoadContent': { load: boolean; element: HTMLElement };
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
  'change': ChangeEvent;
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
  'SetAttrib': SetAttribEvent;
  'hide': { };
  'show': { };
  'dirty': { };
  'BeforeOpenNotification': BeforeOpenNotificationEvent;
  'OpenNotification': OpenNotificationEvent;
}

export interface EditorManagerEventMap {
  'AddEditor': { editor: Editor };
  'RemoveEditor': { editor: Editor };
  'BeforeUnload': { returnValue: any };
}
