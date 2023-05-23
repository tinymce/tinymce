import { AutocompleterEventArgs } from '../autocomplete/AutocompleteTypes';
import { FormatVars } from '../fmt/FormatTypes';
import { RangeLikeObject } from '../selection/RangeTypes';
import Editor from './Editor';
import {
  BeforeSetContentEvent, SetContentEvent, PastePlainTextToggleEvent, PastePostProcessEvent, PastePreProcessEvent, GetContentEvent, BeforeGetContentEvent,
  PreProcessEvent, PostProcessEvent, EditableRootStateChangeEvent
} from './EventTypes';
import { ParserArgs } from './html/DomParser';
import { EditorEvent } from './util/EventDispatcher';

const firePreProcess = (editor: Editor, args: ParserArgs & { node: Element }): EditorEvent<PreProcessEvent> =>
  editor.dispatch('PreProcess', args);

const firePostProcess = (editor: Editor, args: ParserArgs & { content: string }): EditorEvent<PostProcessEvent> =>
  editor.dispatch('PostProcess', args);

const fireRemove = (editor: Editor): void => {
  editor.dispatch('remove');
};

const fireDetach = (editor: Editor): void => {
  editor.dispatch('detach');
};

const fireSwitchMode = (editor: Editor, mode: string): void => {
  editor.dispatch('SwitchMode', { mode });
};

const fireObjectResizeStart = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string): void => {
  editor.dispatch('ObjectResizeStart', { target, width, height, origin });
};

const fireObjectResized = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string): void => {
  editor.dispatch('ObjectResized', { target, width, height, origin });
};

const firePreInit = (editor: Editor): void => {
  editor.dispatch('PreInit');
};

const firePostRender = (editor: Editor): void => {
  editor.dispatch('PostRender');
};

const fireInit = (editor: Editor): void => {
  editor.dispatch('Init');
};

const firePlaceholderToggle = (editor: Editor, state: boolean): void => {
  editor.dispatch('PlaceholderToggle', { state });
};

const fireError = (editor: Editor, errorType: string, error: { message: string }): void => {
  editor.dispatch(errorType, error);
};

const fireFormatApply = (editor: Editor, format: string, node: Node | RangeLikeObject | null | undefined, vars: FormatVars | undefined): void => {
  editor.dispatch('FormatApply', { format, node, vars });
};

const fireFormatRemove = (editor: Editor, format: string, node: Node | RangeLikeObject | null | undefined, vars: FormatVars | undefined): void => {
  editor.dispatch('FormatRemove', { format, node, vars });
};

const fireBeforeSetContent = <T extends BeforeSetContentEvent>(editor: Editor, args: T): EditorEvent<T> =>
  editor.dispatch('BeforeSetContent', args);

const fireSetContent = <T extends SetContentEvent>(editor: Editor, args: T): EditorEvent<T> =>
  editor.dispatch('SetContent', args);

const fireBeforeGetContent = <T extends BeforeGetContentEvent>(editor: Editor, args: T): EditorEvent<T> =>
  editor.dispatch('BeforeGetContent', args);

const fireGetContent = <T extends GetContentEvent>(editor: Editor, args: T): EditorEvent<T> =>
  editor.dispatch('GetContent', args);

const fireAutocompleterStart = (editor: Editor, args: AutocompleterEventArgs): void => {
  editor.dispatch('AutocompleterStart', args);
};

const fireAutocompleterUpdate = (editor: Editor, args: AutocompleterEventArgs): void => {
  editor.dispatch('AutocompleterUpdate', args);
};

const fireAutocompleterEnd = (editor: Editor): void => {
  editor.dispatch('AutocompleterEnd');
};

const firePastePreProcess = (editor: Editor, html: string, internal: boolean): EditorEvent<PastePreProcessEvent> =>
  editor.dispatch('PastePreProcess', { content: html, internal });

const firePastePostProcess = (editor: Editor, node: HTMLElement, internal: boolean): EditorEvent<PastePostProcessEvent> =>
  editor.dispatch('PastePostProcess', { node, internal });

const firePastePlainTextToggle = (editor: Editor, state: boolean): EditorEvent<PastePlainTextToggleEvent> =>
  editor.dispatch('PastePlainTextToggle', { state });

const fireEditableRootStateChange = (editor: Editor, state: boolean): EditorEvent<EditableRootStateChangeEvent> =>
  editor.dispatch('EditableRootStateChange', { state });

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
  firePastePreProcess,
  fireEditableRootStateChange
};
