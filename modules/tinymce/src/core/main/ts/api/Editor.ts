import { Arr, Fun, Type } from '@ephox/katamari';

import * as EditorContent from '../content/EditorContent';
import * as Deprecations from '../Deprecations';
import * as NodeType from '../dom/NodeType';
import * as EditorRemove from '../EditorRemove';
import { BlobInfoImagePair } from '../file/ImageScanner';
import * as EditorFocus from '../focus/EditorFocus';
import * as Render from '../init/Render';
import * as EditableRoot from '../mode/EditableRoot';
import { NodeChange } from '../NodeChange';
import { normalizeOptions } from '../options/NormalizeOptions';
import SelectionOverrides from '../SelectionOverrides';
import { UndoManager } from '../undo/UndoManagerTypes';
import Quirks from '../util/Quirks';
import * as VisualAids from '../view/VisualAids';
import AddOnManager from './AddOnManager';
import Annotator from './Annotator';
import * as Commands from './commands/Commands';
import DOMUtils from './dom/DOMUtils';
import { EventUtilsCallback } from './dom/EventUtils';
import ScriptLoader from './dom/ScriptLoader';
import EditorSelection from './dom/Selection';
import DomSerializer from './dom/Serializer';
import EditorCommands, { ExecCommandArgs, EditorCommandCallback } from './EditorCommands';
import EditorManager from './EditorManager';
import EditorObservable from './EditorObservable';
import { BuiltInOptionType, BuiltInOptionTypeMap, Options as EditorOptions, create as createOptions } from './EditorOptions';
import EditorUpload, { UploadResult } from './EditorUpload';
import Env from './Env';
import { SaveContentEvent } from './EventTypes';
import Formatter from './Formatter';
import DomParser from './html/DomParser';
import AstNode from './html/Node';
import Schema from './html/Schema';
import { create as createMode, EditorMode } from './Mode';
import { Model } from './ModelManager';
import NotificationManager from './NotificationManager';
import * as Options from './Options';
import { NormalizedEditorOptions, RawEditorOptions } from './OptionTypes';
import PluginManager, { Plugin } from './PluginManager';
import Shortcuts from './Shortcuts';
import { Theme } from './ThemeManager';
import { registry } from './ui/Registry';
import { EditorUi } from './ui/Ui';
import EventDispatcher, { NativeEventMap } from './util/EventDispatcher';
import I18n, { TranslatedString, Untranslated } from './util/I18n';
import Tools from './util/Tools';
import URI from './util/URI';
import WindowManager from './WindowManager';

/**
 * This class contains the core logic for a TinyMCE editor.
 *
 * @class tinymce.Editor
 * @mixes tinymce.util.Observable
 * @example
 * // Add a class to all paragraphs in the editor.
 * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'someclass');
 *
 * // Gets the current editors selection as text
 * tinymce.activeEditor.selection.getContent({ format: 'text' });
 *
 * // Creates a new editor instance
 * const ed = new tinymce.Editor('textareaid', {
 *   some_setting: 1
 * }, tinymce.EditorManager);
 *
 * ed.render();
 */

export interface EditorConstructor {
  readonly prototype: Editor;

  new (id: string, options: RawEditorOptions, editorManager: EditorManager): Editor;
}

// Shorten these names
const DOM = DOMUtils.DOM;
const extend = Tools.extend, each = Tools.each;

/**
 * Include Editor API docs.
 *
 * @include ../../../../../tools/docs/tinymce.Editor.js
 */

class Editor implements EditorObservable {
  public documentBaseUrl: string;
  public baseUri: URI;

  /**
   * Editor instance id, normally the same as the div/textarea that was replaced.
   *
   * @property id
   * @type String
   */
  public id: string;

  /**
   * Name/Value object containing plugin instances.
   *
   * @property plugins
   * @type Object
   * @example
   * // Execute a method inside a plugin directly
   * tinymce.activeEditor.plugins.someplugin.someMethod();
   */
  public plugins: Record<string, Plugin> = {};

  /**
   * URI object to document configured for the TinyMCE instance.
   *
   * @property documentBaseURI
   * @type tinymce.util.URI
   * @example
   * // Get relative URL from the location of document_base_url
   * tinymce.activeEditor.documentBaseURI.toRelative('/somedir/somefile.htm');
   *
   * // Get absolute URL from the location of document_base_url
   * tinymce.activeEditor.documentBaseURI.toAbsolute('somefile.htm');
   */
  public documentBaseURI: URI;

  /**
   * URI object to current document that holds the TinyMCE editor instance.
   *
   * @property baseURI
   * @type tinymce.util.URI
   * @example
   * // Get relative URL from the location of the API
   * tinymce.activeEditor.baseURI.toRelative('/somedir/somefile.htm');
   *
   * // Get absolute URL from the location of the API
   * tinymce.activeEditor.baseURI.toAbsolute('somefile.htm');
   */
  public baseURI: URI;

  /**
   * Array with CSS files to load into the iframe.
   *
   * @property contentCSS
   * @type Array
   */
  public contentCSS: string[] = [];

  /**
   * Array of CSS styles to add to head of document when the editor loads.
   *
   * @property contentStyles
   * @type Array
   */
  public contentStyles: string[] = [];

  /**
   * Editor ui components
   *
   * @property ui
   * @type tinymce.editor.ui.Ui
   */
  public ui: EditorUi;

  /**
   * Editor mode API
   *
   * @property mode
   * @type tinymce.EditorMode
   */
  public mode: EditorMode;

  /**
   * Editor options API
   *
   * @property options
   * @type tinymce.EditorOptions
   */
  public options: EditorOptions;

  /**
   * Editor upload API
   *
   * @property editorUpload
   * @type tinymce.EditorUpload
   */
  public editorUpload!: EditorUpload;

  public shortcuts: Shortcuts;
  public loadedCSS: Record<string, any> = {};
  public editorCommands: EditorCommands;
  public suffix: string;
  public editorManager: EditorManager;
  public hidden: boolean;
  public inline: boolean;
  public hasVisual: boolean;

  public isNotDirty: boolean = false;

  // Arguments set later, for example by InitContentBody.ts
  // Note that these may technically be undefined up until PreInit (or similar) has fired,
  // however the types are aimed at an initialised editor for ease of use.
  public annotator!: Annotator;
  public bodyElement: HTMLElement | undefined;
  public bookmark: any; // Note: Intentionally any so as to not expose Optional
  public composing: boolean = false;
  public container!: HTMLElement;
  public contentAreaContainer!: HTMLElement;
  public contentDocument!: Document;
  public contentWindow!: Window;
  public delegates: Record<string, EventUtilsCallback<any>> | undefined;
  public destroyed: boolean = false;
  public dom!: DOMUtils;
  public editorContainer!: HTMLElement;
  public eventRoot: Element | undefined;
  public formatter!: Formatter;
  public formElement: HTMLElement | undefined;
  public formEventDelegate: ((e: Event) => void) | undefined;
  public hasHiddenInput: boolean = false;
  public iframeElement: HTMLIFrameElement | null = null;
  public iframeHTML: string | undefined;
  public initialized: boolean = false;
  public notificationManager!: NotificationManager;
  public orgDisplay!: string;
  public orgVisibility: string | undefined;
  public parser!: DomParser;
  public quirks!: Quirks;
  public readonly: boolean = false;
  public removed: boolean = false;
  public schema!: Schema;
  public selection!: EditorSelection;
  public serializer!: DomSerializer;
  public startContent: string = '';
  public targetElm!: HTMLElement;
  public theme!: Theme;
  public model!: Model;
  public undoManager!: UndoManager;
  public windowManager!: WindowManager;
  public _beforeUnload: (() => void) | undefined;
  public _eventDispatcher: EventDispatcher<NativeEventMap> | undefined;
  public _nodeChangeDispatcher!: NodeChange;
  public _pendingNativeEvents: string[] = [];
  public _selectionOverrides!: SelectionOverrides;
  public _skinLoaded: boolean = false;
  public _editableRoot: boolean = true;

  // EditorObservable patches
  public bindPendingEventDelegates!: EditorObservable['bindPendingEventDelegates'];
  public toggleNativeEvent!: EditorObservable['toggleNativeEvent'];
  public unbindAllNativeEvents!: EditorObservable['unbindAllNativeEvents'];
  public fire!: EditorObservable['fire'];
  public dispatch!: EditorObservable['dispatch'];
  public on!: EditorObservable['on'];
  public off!: EditorObservable['off'];
  public once!: EditorObservable['once'];
  public hasEventListeners!: EditorObservable['hasEventListeners'];

  /**
   * Constructs a editor instance by id.
   *
   * @constructor
   * @method Editor
   * @param {String} id Unique id for the editor.
   * @param {Object} options Options for the editor.
   * @param {tinymce.EditorManager} editorManager EditorManager instance.
   */
  public constructor(id: string, options: RawEditorOptions, editorManager: EditorManager) {
    this.editorManager = editorManager;
    this.documentBaseUrl = editorManager.documentBaseURL;

    // Patch in the EditorObservable functions
    extend(this, EditorObservable);
    const self = this;

    this.id = id;
    this.hidden = false;
    const normalizedOptions = normalizeOptions(editorManager.defaultOptions, options);

    this.options = createOptions(self, normalizedOptions);
    Options.register(self);
    const getOption = this.options.get;

    if (getOption('deprecation_warnings')) {
      Deprecations.logWarnings(options, normalizedOptions);
    }

    const suffix = getOption('suffix');
    if (suffix) {
      editorManager.suffix = suffix;
    }
    this.suffix = editorManager.suffix;

    const baseUrl = getOption('base_url');
    if (baseUrl) {
      editorManager._setBaseUrl(baseUrl);
    }
    this.baseUri = editorManager.baseURI;

    const referrerPolicy = Options.getReferrerPolicy(self);
    if (referrerPolicy) {
      ScriptLoader.ScriptLoader._setReferrerPolicy(referrerPolicy);
      DOMUtils.DOM.styleSheetLoader._setReferrerPolicy(referrerPolicy);
    }

    const contentCssCors = Options.hasContentCssCors(self);
    if (Type.isNonNullable(contentCssCors)) {
      DOMUtils.DOM.styleSheetLoader._setContentCssCors(contentCssCors);
    }

    AddOnManager.languageLoad = getOption('language_load');
    AddOnManager.baseURL = editorManager.baseURL;

    this.setDirty(false);

    this.documentBaseURI = new URI(Options.getDocumentBaseUrl(self), {
      base_uri: this.baseUri
    });
    this.baseURI = this.baseUri;
    this.inline = Options.isInline(self);
    this.hasVisual = Options.isVisualAidsEnabled(self);

    this.shortcuts = new Shortcuts(this);
    this.editorCommands = new EditorCommands(this);
    Commands.registerCommands(this);

    const cacheSuffix = getOption('cache_suffix');
    if (cacheSuffix) {
      Env.cacheSuffix = cacheSuffix.replace(/^[\?\&]+/, '');
    }

    this.ui = {
      registry: registry(),
      styleSheetLoader: undefined as any,
      show: Fun.noop,
      hide: Fun.noop,
      setEnabled: Fun.noop,
      isEnabled: Fun.always
    };

    this.mode = createMode(self);

    // Call setup
    editorManager.dispatch('SetupEditor', { editor: this });
    const setupCallback = Options.getSetupCallback(self);
    if (Type.isFunction(setupCallback)) {
      setupCallback.call(self, self);
    }
  }

  /**
   * Renders the editor/adds it to the page.
   *
   * @method render
   */
  public render(): void {
    Render.render(this);
  }

  /**
   * Focuses/activates the editor. This will set this editor as the activeEditor in the tinymce collection
   * it will also place DOM focus inside the editor.
   *
   * @method focus
   * @param {Boolean} skipFocus Skip DOM focus. Just set is as the active editor.
   */
  public focus(skipFocus?: boolean): void {
    this.execCommand('mceFocus', false, skipFocus);
  }

  /**
   * Returns true/false if the editor has real keyboard focus.
   *
   * @method hasFocus
   * @return {Boolean} Current focus state of the editor.
   */
  public hasFocus(): boolean {
    return EditorFocus.hasFocus(this);
  }

  /**
   * Translates the specified string by replacing variables with language pack items it will also check if there is
   * a key matching the input.
   *
   * @method translate
   * @param {String} text String to translate by the language pack data.
   * @return {String} Translated string.
   */
  public translate(text: Untranslated): TranslatedString {
    return I18n.translate(text);
  }

  /**
   * Returns a configuration parameter by name.
   * <br>
   * <em>Deprecated in TinyMCE 6.0 and has been marked for removal in TinyMCE 7.0. Use the <code>editor.options.get</code> API instead.</em>
   *
   * @method getParam
   * @param {String} name Configuration parameter to retrieve.
   * @param {String} defaultVal Optional default value to return.
   * @param {String} type Optional type parameter.
   * @return {String} Configuration parameter value or default value.
   * @deprecated Use editor.options.get instead
   * @example
   * // Returns a specific config value from the currently active editor
   * const someval = tinymce.activeEditor.getParam('myvalue');
   *
   * // Returns a specific config value from a specific editor instance by id
   * const someval2 = tinymce.get('my_editor').getParam('myvalue');
   */
  public getParam <K extends BuiltInOptionType>(name: string, defaultVal: BuiltInOptionTypeMap[K], type: K): BuiltInOptionTypeMap[K];
  public getParam <K extends keyof NormalizedEditorOptions>(name: K, defaultVal?: NormalizedEditorOptions[K], type?: BuiltInOptionType): NormalizedEditorOptions[K];
  public getParam <T>(name: string, defaultVal: T, type?: BuiltInOptionType): T;
  public getParam(name: string, defaultVal?: any, type?: BuiltInOptionType): any {
    const options = this.options;

    // To keep the legacy API we need to register the option if it's not already been registered
    if (!options.isRegistered(name)) {
      if (Type.isNonNullable(type)) {
        options.register(name, { processor: type, default: defaultVal });
      } else {
        options.register(name, { processor: Fun.always, default: defaultVal });
      }
    }

    // Attempt to use the passed default value if nothing has been set already
    return !options.isSet(name) && !Type.isUndefined(defaultVal) ? defaultVal : options.get(name);
  }

  /**
   * Checks that the plugin is in the editor configuration and can optionally check if the plugin has been loaded.
   *
   * @method hasPlugin
   * @param {String} name The name of the plugin, as specified for the TinyMCE `plugins` option.
   * @param {Boolean} loaded If `true`, will also check that the plugin has been loaded.
   * @return {Boolean} If `loaded` is `true`, returns `true` if the plugin is in the configuration and has been loaded. If `loaded` is `false`, returns `true` if the plugin is in the configuration, regardless of plugin load status.
   * @example
   * // Returns `true` if the Comments plugin is in the editor configuration and has loaded successfully:
   * tinymce.activeEditor.hasPlugin('tinycomments', true);
   * // Returns `true` if the Table plugin is in the editor configuration, regardless of whether or not it loads:
   * tinymce.activeEditor.hasPlugin('table');
   */
  public hasPlugin(name: string, loaded?: boolean): boolean {
    const hasPlugin = Arr.contains(Options.getPlugins(this), name);
    if (hasPlugin) {
      return loaded ? PluginManager.get(name) !== undefined : true;
    } else {
      return false;
    }
  }

  /**
   * Dispatches out a onNodeChange event to all observers. This method should be called when you
   * need to update the UI states or element path etc.
   *
   * @method nodeChanged
   * @param {Object} args Optional args to pass to NodeChange event handlers.
   */
  public nodeChanged(args?: any): void {
    this._nodeChangeDispatcher.nodeChanged(args);
  }

  /**
   * Adds a custom command to the editor. This function can also be used to override existing commands.
   * The command that you add can be executed with execCommand.
   *
   * @method addCommand
   * @param {String} name Command name to add/override.
   * @param {Function} callback Function to execute when the command occurs.
   * @param {Object} scope Optional scope to execute the function in.
   * @example
   * // Adds a custom command that later can be executed using execCommand
   * tinymce.init({
   *  ...
   *
   *   setup: (ed) => {
   *     // Register example command
   *     ed.addCommand('mycommand', (ui, v) => {
   *       ed.windowManager.alert('Hello world!! Selection: ' + ed.selection.getContent({ format: 'text' }));
   *     });
   *   }
   * });
   */
  public addCommand<S>(name: string, callback: EditorCommandCallback<S>, scope: S): void;
  public addCommand(name: string, callback: EditorCommandCallback<Editor>): void;
  public addCommand(name: string, callback: EditorCommandCallback<any>, scope?: object): void {
    /**
     * Callback function that gets called when a command is executed.
     *
     * @callback addCommandCallback
     * @param {Boolean} ui Display UI state true/false.
     * @param {Object} value Optional value for command.
     * @return {Boolean} True/false state if the command was handled or not.
     */
    this.editorCommands.addCommand(name, callback, scope);
  }

  /**
   * Adds a custom query state command to the editor. This function can also be used to override existing commands.
   * The command that you add can be executed with queryCommandState function.
   *
   * @method addQueryStateHandler
   * @param {String} name Command name to add/override.
   * @param {Function} callback Function to execute when the command state retrieval occurs.
   * @param {Object} scope Optional scope to execute the function in.
   */
  public addQueryStateHandler<S>(name: string, callback: (this: S) => boolean, scope?: S): void;
  public addQueryStateHandler(name: string, callback: (this: Editor) => boolean): void;
  public addQueryStateHandler(name: string, callback: (this: any) => boolean, scope?: any): void {
    /**
     * Callback function that gets called when a queryCommandState is executed.
     *
     * @callback addQueryStateHandlerCallback
     * @return {Boolean} True/false state if the command is enabled or not like is it bold.
     */
    this.editorCommands.addQueryStateHandler(name, callback, scope);
  }

  /**
   * Adds a custom query value command to the editor. This function can also be used to override existing commands.
   * The command that you add can be executed with queryCommandValue function.
   *
   * @method addQueryValueHandler
   * @param {String} name Command name to add/override.
   * @param {Function} callback Function to execute when the command value retrieval occurs.
   * @param {Object} scope Optional scope to execute the function in.
   */
  public addQueryValueHandler<S>(name: string, callback: (this: S) => string, scope: S): void;
  public addQueryValueHandler(name: string, callback: (this: Editor) => string): void;
  public addQueryValueHandler(name: string, callback: (this: any) => string, scope?: any): void {
    /**
     * Callback function that gets called when a queryCommandValue is executed.
     *
     * @callback addQueryValueHandlerCallback
     * @return {Object} Value of the command or undefined.
     */
    this.editorCommands.addQueryValueHandler(name, callback, scope);
  }

  /**
   * Adds a keyboard shortcut for some command or function.
   *
   * @method addShortcut
   * @param {String} pattern Shortcut pattern. Like for example: ctrl+alt+o.
   * @param {String} desc Text description for the command.
   * @param {String/Function} cmdFunc Command name string or function to execute when the key is pressed.
   * @param {Object} scope Optional scope to execute the function in.
   * @return {Boolean} true/false state if the shortcut was added or not.
   * @example
   * editor.addShortcut('ctrl+a', 'description of the shortcut', () => {});
   * editor.addShortcut('ctrl+alt+a', 'description of the shortcut', () => {});
   * // "meta" maps to Command on Mac and Ctrl on PC
   * editor.addShortcut('meta+a', 'description of the shortcut', () => {});
   * // "access" maps to Control+Option on Mac and shift+alt on PC
   * editor.addShortcut('access+a', 'description of the shortcut', () => {});
   *
   * editor.addShortcut('meta+access+c', 'Opens the code editor dialog.', () => {
   *   editor.execCommand('mceCodeEditor');
   * });
   *
   * editor.addShortcut('meta+shift+32', 'Inserts "Hello, World!" for meta+shift+space', () => {
   *   editor.execCommand('mceInsertContent', false, 'Hello, World!');
   * });
   */
  public addShortcut(pattern: string, desc: string, cmdFunc: string | [string, boolean, any] | (() => void), scope?: any): void {
    this.shortcuts.add(pattern, desc, cmdFunc, scope);
  }

  /**
   * Executes a registered command on the current instance. A list of available commands can be found in
   * the tinymce command identifiers documentation.
   *
   * @method execCommand
   * @param {String} cmd Command name to execute, for example mceLink or Bold.
   * @param {Boolean} ui Specifies if a UI (dialog) should be presented or not.
   * @param {Object/Array/String/Number/Boolean} value Optional command value, this can be anything.
   * @param {Object} args Optional arguments object.
   * @return {Boolean} true or false if the command was supported or not.
   */
  public execCommand(cmd: string, ui?: boolean, value?: any, args?: ExecCommandArgs): boolean {
    return this.editorCommands.execCommand(cmd, ui, value, args);
  }

  /**
   * Returns a command specific state, for example if bold is enabled or not.
   *
   * @method queryCommandState
   * @param {String} cmd Command to query state from.
   * @return {Boolean} Command specific state, for example if bold is enabled or not.
   */
  public queryCommandState(cmd: string): boolean {
    return this.editorCommands.queryCommandState(cmd);
  }

  /**
   * Returns a command specific value, for example the current font size.
   *
   * @method queryCommandValue
   * @param {String} cmd Command to query value from.
   * @return {String} Command value, for example the current font size or an empty string (`""`) if the query command is not found.
   */
  public queryCommandValue(cmd: string): string {
    return this.editorCommands.queryCommandValue(cmd);
  }

  /**
   * Returns true/false if the command is supported or not.
   *
   * @method queryCommandSupported
   * @param {String} cmd Command that we check support for.
   * @return {Boolean} true/false if the command is supported or not.
   */
  public queryCommandSupported(cmd: string): boolean {
    return this.editorCommands.queryCommandSupported(cmd);
  }

  /**
   * Shows the editor and hides any textarea/div that the editor is supposed to replace.
   *
   * @method show
   */
  public show(): void {
    const self = this;

    if (self.hidden) {
      self.hidden = false;

      if (self.inline) {
        self.getBody().contentEditable = 'true';
      } else {
        DOM.show(self.getContainer());
        DOM.hide(self.id);
      }

      self.load();
      self.dispatch('show');
    }
  }

  /**
   * Hides the editor and shows any textarea/div that the editor is supposed to replace.
   *
   * @method hide
   */
  public hide(): void {
    const self = this;

    if (!self.hidden) {
      // We must save before we hide so Safari doesn't crash
      self.save();

      if (self.inline) {
        self.getBody().contentEditable = 'false';

        // Make sure the editor gets blurred
        if (self === self.editorManager.focusedEditor) {
          self.editorManager.focusedEditor = null;
        }
      } else {
        DOM.hide(self.getContainer());
        DOM.setStyle(self.id, 'display', self.orgDisplay);
      }

      self.hidden = true;
      self.dispatch('hide');
    }
  }

  /**
   * Returns true/false if the editor is hidden or not.
   *
   * @method isHidden
   * @return {Boolean} True/false if the editor is hidden or not.
   */
  public isHidden(): boolean {
    return this.hidden;
  }

  /**
   * Sets the progress state, this will display a throbber/progess for the editor.
   * This is ideal for asynchronous operations like an AJAX save call.
   *
   * @method setProgressState
   * @param {Boolean} state Boolean state if the progress should be shown or hidden.
   * @param {Number} time Optional time to wait before the progress gets shown.
   * @return {Boolean} Same as the input state.
   * @example
   * // Show progress for the active editor
   * tinymce.activeEditor.setProgressState(true);
   *
   * // Hide progress for the active editor
   * tinymce.activeEditor.setProgressState(false);
   *
   * // Show progress after 3 seconds
   * tinymce.activeEditor.setProgressState(true, 3000);
   */
  public setProgressState(state: boolean, time?: number): void {
    this.dispatch('ProgressState', { state, time });
  }

  /**
   * Loads contents from the textarea, input or other element that got converted into an editor instance.
   * This method will move the contents from that textarea, input or other element into the editor by using setContent
   * so all events etc that method has will get dispatched as well.
   *
   * @method load
   * @param {Object} args Optional content object, this gets passed around through the whole load process.
   * @return {String} HTML string that got set into the editor.
   */
  public load(args: Partial<EditorContent.SetContentArgs> = {}): string {
    const self = this;
    const elm = self.getElement();

    if (self.removed) {
      return '';
    }

    if (elm) {
      const loadArgs: Partial<EditorContent.SetContentArgs> & { load: boolean } = {
        ...args,
        load: true
      };

      const value = NodeType.isTextareaOrInput(elm) ? elm.value : elm.innerHTML;

      const html = self.setContent(value, loadArgs);

      if (!loadArgs.no_events) {
        self.dispatch('LoadContent', {
          ...loadArgs,
          element: elm
        });
      }

      return html;
    } else {
      return '';
    }
  }

  /**
   * Saves the contents from an editor out to the textarea or div element that got converted into an editor instance.
   * This method will move the HTML contents from the editor into that textarea or div by getContent
   * so all events etc that method has will get dispatched as well.
   *
   * @method save
   * @param {Object} args Optional content object, this gets passed around through the whole save process.
   * @return {String} HTML string that got set into the textarea/div.
   */
  public save(args: Partial<EditorContent.GetContentArgs> = {}): string {
    const self = this;
    let elm: HTMLElement | null = self.getElement();

    if (!elm || !self.initialized || self.removed) {
      return '';
    }

    const getArgs: Partial<EditorContent.GetContentArgs> = {
      ...args,
      save: true,
      element: elm
    };

    let html = self.getContent(getArgs);

    const saveArgs = { ...getArgs, content: html } as SaveContentEvent;
    if (!saveArgs.no_events) {
      self.dispatch('SaveContent', saveArgs);
    }

    // Always run this internal event
    if (saveArgs.format === 'raw') {
      self.dispatch('RawSaveContent', saveArgs);
    }

    html = saveArgs.content;

    if (!NodeType.isTextareaOrInput(elm)) {
      if (args.is_removing || !self.inline) {
        elm.innerHTML = html;
      }

      // Update hidden form element
      const form = DOM.getParent(self.id, 'form');
      if (form) {
        each(form.elements, (elm) => {
          if ((elm as any).name === self.id) {
            (elm as any).value = html;
            return false;
          } else {
            return true;
          }
        });
      }
    } else {
      elm.value = html;
    }

    saveArgs.element = getArgs.element = elm = null;

    if (saveArgs.set_dirty !== false) {
      self.setDirty(false);
    }

    return html;
  }

  /**
   * Sets the specified content to the editor instance, this will cleanup the content before it gets set using
   * the different cleanup rules options.
   * <br>
   * <em>Note: The content return value was deprecated in TinyMCE 6.0 and has been marked for removal in TinyMCE 7.0.</em>
   *
   * @method setContent
   * @param {String} content Content to set to editor, normally HTML contents but can be other formats as well.
   * @param {Object} args Optional content object, this gets passed around through the whole set process.
   * @return {String} HTML string that got set into the editor.
   * @example
   * // Sets the HTML contents of the activeEditor editor
   * tinymce.activeEditor.setContent('<span>some</span> html');
   *
   * // Sets the content of a specific editor (my_editor in this example)
   * tinymce.get('my_editor').setContent(data);
   *
   * // Sets the content of the activeEditor editor using the specified format
   * tinymce.activeEditor.setContent('<p>Some html</p>', { format: 'html' });
   */
  public setContent(content: string, args?: Partial<EditorContent.SetContentArgs>): string;
  public setContent(content: AstNode, args?: Partial<EditorContent.SetContentArgs>): AstNode;
  public setContent(content: EditorContent.Content, args?: Partial<EditorContent.SetContentArgs>): EditorContent.Content;
  public setContent(content: EditorContent.Content, args?: Partial<EditorContent.SetContentArgs>): EditorContent.Content {
    return EditorContent.setContent(this, content, args);
  }

  /**
   * Gets the content from the editor instance, this will cleanup the content before it gets returned using
   * the different cleanup rules options.
   *
   * @method getContent
   * @param {Object} args Optional content object, this gets passed around through the whole get process.
   * @return {String} Cleaned content string, normally HTML contents.
   * @example
   * // Get the HTML contents of the currently active editor
   * console.debug(tinymce.activeEditor.getContent());
   *
   * // Get the contents of the currently active editor as plain text
   * tinymce.activeEditor.getContent({ format: 'text' });
   *
   * // Get content of a specific editor:
   * tinymce.get('content id').getContent()
   */
  public getContent(args: { format: 'tree' } & Partial<EditorContent.GetContentArgs>): AstNode;
  public getContent(args?: Partial<EditorContent.GetContentArgs>): string;
  public getContent(args?: Partial<EditorContent.GetContentArgs>): EditorContent.Content {
    return EditorContent.getContent(this, args);
  }

  /**
   * Inserts content at caret position.
   *
   * @method insertContent
   * @param {String} content Content to insert.
   * @param {Object} args Optional args to pass to insert call.
   */
  public insertContent(content: string, args?: any): void {
    if (args) {
      content = extend({ content }, args);
    }

    this.execCommand('mceInsertContent', false, content);
  }

  /**
   * Resets the editors content, undo/redo history and dirty state. If `initialContent` isn't specified, then
   * the editor is reset back to the initial start content.
   *
   * @method resetContent
   * @param {String} initialContent An optional string to use as the initial content of the editor.
   */
  public resetContent(initialContent?: string): void {
    // Set the editor content
    if (initialContent === undefined) {
      // editor.startContent is generated by using the `raw` format, so we should set it the same way
      EditorContent.setContent(this, this.startContent, { format: 'raw' });
    } else {
      EditorContent.setContent(this, initialContent);
    }

    // Update the editor/undo manager state
    this.undoManager.reset();
    this.setDirty(false);

    // Fire a node change event
    this.nodeChanged();
  }

  /**
   * Returns true/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
   *
   * The dirty state is automatically set to `true` when the user modifies editor content after initialization or the
   * last `editor.save()` call. This includes changes made using undo or redo.
   *
   * @method isDirty
   * @return {Boolean} True/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
   * @example
   * if (tinymce.activeEditor.isDirty()) {
   *   alert("You must save your contents.");
   * }
   */
  public isDirty(): boolean {
    return !this.isNotDirty;
  }

  /**
   * Explicitly sets the dirty state. This will fire the dirty event if the editor dirty state is changed from false to true
   * by invoking this method.
   *
   * @method setDirty
   * @param {Boolean} state True/false if the editor is considered dirty.
   * @example
   * const ajaxSave = () => {
   *   const editor = tinymce.get('elm1');
   *
   *   // Save contents using some XHR call
   *   alert(editor.getContent());
   *
   *   editor.setDirty(false); // Force not dirty state
   * }
   */
  public setDirty(state: boolean): void {
    const oldState = !this.isNotDirty;

    this.isNotDirty = !state;

    if (state && state !== oldState) {
      this.dispatch('dirty');
    }
  }

  /**
   * Returns the container element of the editor. The container element includes
   * all the elements added to the page for the editor. Such as UI, iframe, etc.
   *
   * @method getContainer
   * @return {Element} HTML DOM element for the editor container.
   */
  public getContainer(): HTMLElement {
    const self = this;

    if (!self.container) {
      self.container = self.editorContainer || DOM.get(self.id + '_parent') as HTMLElement;
    }

    return self.container;
  }

  /**
   * Returns the content area container element of the editor. This element
   * holds the iframe or the editable element.
   *
   * @method getContentAreaContainer
   * @return {Element} HTML DOM element for the editor area container.
   */
  public getContentAreaContainer(): HTMLElement {
    return this.contentAreaContainer;
  }

  /**
   * Returns the target element/textarea that got replaced with a TinyMCE editor instance.
   *
   * @method getElement
   * @return {Element} HTML DOM element for the replaced element.
   */
  public getElement(): HTMLElement {
    if (!this.targetElm) {
      this.targetElm = DOM.get(this.id) as HTMLElement;
    }

    return this.targetElm;
  }

  /**
   * Returns the iframes window object.
   *
   * @method getWin
   * @return {Window} Iframe DOM window object.
   */
  public getWin(): Window {
    const self = this;

    if (!self.contentWindow) {
      const elm = self.iframeElement;

      if (elm) {
        self.contentWindow = elm.contentWindow as Window;
      }
    }

    return self.contentWindow;
  }

  /**
   * Returns the iframes document object.
   *
   * @method getDoc
   * @return {Document} Iframe DOM document object.
   */
  public getDoc(): Document {
    const self = this;

    if (!self.contentDocument) {
      const win = self.getWin();

      if (win) {
        self.contentDocument = win.document;
      }
    }

    return self.contentDocument;
  }

  /**
   * Returns the root element of the editable area.
   * For a non-inline iframe-based editor, returns the iframe's body element.
   *
   * @method getBody
   * @return {Element} The root element of the editable area.
   */
  public getBody(): HTMLElement {
    const doc = this.getDoc();
    return this.bodyElement ?? doc?.body ?? null;
  }

  /**
   * URL converter function this gets executed each time a user adds an img, a or
   * any other element that has a URL in it. This will be called both by the DOM and HTML
   * manipulation functions.
   *
   * @method convertURL
   * @param {String} url URL to convert.
   * @param {String} name Attribute name src, href etc.
   * @param {String/HTMLElement} elm Tag name or HTML DOM element depending on HTML or DOM insert.
   * @return {String} Converted URL string.
   */
  public convertURL(url: string, name: string, elm?: string | Element): string {
    const self = this, getOption = self.options.get;

    // Use callback instead
    const urlConverterCallback = Options.getUrlConverterCallback(self);
    if (Type.isFunction(urlConverterCallback)) {
      return urlConverterCallback.call(self, url, elm, true, name);
    }

    // Don't convert link href since that's the CSS files that gets loaded into the editor also skip local file URLs
    if (
      !getOption('convert_urls') ||
      elm === 'link' ||
      (Type.isObject(elm) && (elm as HTMLElement).nodeName === 'LINK') ||
      url.indexOf('file:') === 0 ||
      url.length === 0 ) {
      return url;
    }

    const urlObject = new URI(url);

    if (urlObject.protocol !== 'http' && urlObject.protocol !== 'https' && urlObject.protocol !== '') {
      return url;
    }

    // Convert to relative
    if (getOption('relative_urls')) {
      return self.documentBaseURI.toRelative(url);
    }

    // Convert to absolute
    url = self.documentBaseURI.toAbsolute(url, getOption('remove_script_host'));

    return url;
  }

  /**
   * Adds visual aids for tables, anchors, etc so they can be more easily edited inside the editor.
   *
   * @method addVisual
   * @param {Element} elm Optional root element to loop though to find tables, etc that needs the visual aid.
   */
  public addVisual(elm?: HTMLElement): void {
    VisualAids.addVisual(this, elm);
  }

  /**
   * Changes the editable state of the editor's root element.
   *
   * @method setEditableRoot
   * @param {Boolean} state State to set true for editable and false for non-editable.
   */
  public setEditableRoot(state: boolean): void {
    EditableRoot.setEditableRoot(this, state);
  }

  /**
   * Returns the current editable state of the editor's root element.
   *
   * @method hasEditableRoot
   * @return {Boolean} True if the root element is editable, false if it is not editable.
   */
  public hasEditableRoot(): boolean {
    return EditableRoot.hasEditableRoot(this);
  }

  /**
   * Removes the editor from the dom and tinymce collection.
   *
   * @method remove
   */
  public remove(): void {
    EditorRemove.remove(this);
  }

  /**
   * Destroys the editor instance by removing all events, element references or other resources
   * that could leak memory. This method will be called automatically when the page is unloaded
   * but you can also call it directly if you know what you are doing.
   *
   * @method destroy
   * @param {Boolean} automatic Optional state if the destroy is an automatic destroy or user called one.
   */
  public destroy(automatic?: boolean): void {
    EditorRemove.destroy(this, automatic);
  }

  /**
   * Uploads all data uri/blob uri images in the editor contents to server.
   *
   * @method uploadImages
   * @return {Promise} Promise instance with images and status for each image.
   */
  public uploadImages(): Promise<UploadResult[]> {
    return this.editorUpload.uploadImages();
  }

  // Internal functions

  public _scanForImages(): Promise<BlobInfoImagePair[]> {
    return this.editorUpload.scanForImages();
  }
}

export default Editor;
