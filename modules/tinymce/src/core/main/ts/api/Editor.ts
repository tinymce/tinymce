/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Registry } from '@ephox/bridge';
import { Document, Element, Event, HTMLElement, HTMLIFrameElement, Window } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import * as EditorContent from '../content/EditorContent';
import * as NodeType from '../dom/NodeType';
import * as EditorRemove from '../EditorRemove';
import { getEditorSettings, getParam, ParamTypeMap } from '../EditorSettings';
import { BlobInfoImagePair } from '../file/ImageScanner';
import * as EditorFocus from '../focus/EditorFocus';
import * as Render from '../init/Render';
import { NodeChange } from '../NodeChange';
import SelectionOverrides from '../SelectionOverrides';
import { UndoManager } from '../undo/UndoManagerTypes';
import Quirks from '../util/Quirks';
import AddOnManager from './AddOnManager';
import Annotator from './Annotator';
import DomQuery, { DomQueryConstructor } from './dom/DomQuery';
import DOMUtils from './dom/DOMUtils';
import ScriptLoader from './dom/ScriptLoader';
import Selection from './dom/Selection';
import DomSerializer from './dom/Serializer';
import EditorCommands, { EditorCommandCallback } from './EditorCommands';
import EditorManager from './EditorManager';
import EditorObservable from './EditorObservable';
import EditorUpload, { UploadCallback, UploadResult } from './EditorUpload';
import Env from './Env';
import Formatter from './Formatter';
import DomParser from './html/DomParser';
import Node from './html/Node';
import Schema from './html/Schema';
import { create, Mode } from './Mode';
import NotificationManager from './NotificationManager';
import { Plugin } from './PluginManager';
import { EditorSettings, RawEditorSettings } from './SettingsTypes';
import Shortcuts from './Shortcuts';
import { Theme } from './ThemeManager';
import { registry } from './ui/Registry';
import EventDispatcher, { NativeEventMap } from './util/EventDispatcher';
import I18n, { TranslatedString, Untranslated } from './util/I18n';
import Tools from './util/Tools';
import URI from './util/URI';
import WindowManager from './WindowManager';
import { StyleSheetLoader } from './dom/StyleSheetLoader';

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
 * tinymce.activeEditor.selection.getContent({format: 'text'});
 *
 * // Creates a new editor instance
 * var ed = new tinymce.Editor('textareaid', {
 *     some_setting: 1
 * }, tinymce.EditorManager);
 *
 * ed.render();
 */

export interface Ui {
  registry: Registry.Registry;
  /** StyleSheetLoader for styles in the editor UI. For content styles, use editor.dom.styleSheetLoader. */
  styleSheetLoader: StyleSheetLoader;
}

export interface EditorConstructor {
  readonly prototype: Editor;

  new (id: string, settings: RawEditorSettings, editorManager: EditorManager): Editor;
}

// Shorten these names
const DOM = DOMUtils.DOM;
const extend = Tools.extend, each = Tools.each;
const resolve = Tools.resolve;
const ie = Env.ie;

/**
 * Include Editor API docs.
 *
 * @include ../../../../../tools/docs/tinymce.Editor.js
 */

class Editor implements EditorObservable {
  public documentBaseUrl: string;
  public baseUri: URI;

  /**
   * Name/value collection with editor settings.
   *
   * @property settings
   * @type Object
   * @example
   * // Get the value of the theme setting
   * tinymce.activeEditor.windowManager.alert("You are using the " + tinymce.activeEditor.settings.theme + " theme");
   */
  public settings: EditorSettings;

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
  public ui: Ui;

  /**
   * Editor mode API
   *
   * @property mode
   * @type tinymce.EditorMode
   */
  public mode: Mode;

  /**
   * Sets the editor mode. For example: "design", "code" or "readonly".
   * <br>
   * <em>Deprecated in TinyMCE 5.0.4</em> - Use <code>editor.mode.set(mode)</code> instead.
   *
   * @method setMode
   * @param {String} mode Mode to set the editor in.
   * @deprecated now an alias for editor.mode.set()
   */
  public setMode: (mode: string) => void;

  /**
   * Dom query instance with default scope to the editor document and default element is the body of the editor.
   *
   * @property $
   * @type tinymce.dom.DomQuery
   * @example
   * tinymce.activeEditor.$('p').css('color', 'red');
   * tinymce.activeEditor.$().append('<p>new</p>');
   */
  public $: DomQueryConstructor;

  public shortcuts: Shortcuts;
  public loadedCSS: Record<string, any> = {};
  public editorCommands: EditorCommands;
  public suffix: string;
  public editorManager: EditorManager;
  public inline: boolean;

  public isNotDirty: boolean = false;

  // TODO type these properties
  public callbackLookup: any;
  public _nodeChangeDispatcher: NodeChange;
  public editorUpload: EditorUpload;

  // Arguments set later, for example by InitContentBody.ts
  public annotator: Annotator;
  public bodyElement: HTMLElement;
  public bookmark: Option<{}>;
  public composing: boolean;
  public container: HTMLElement;
  public contentAreaContainer: HTMLElement;
  public contentDocument: Document;
  public contentWindow: Window;
  public delegates: Record<string, (event: any) => void>;
  public destroyed: boolean;
  public dom: DOMUtils;
  public editorContainer: HTMLElement;
  public eventRoot?: Element;
  public formatter: Formatter;
  public formElement: HTMLElement;
  public formEventDelegate: (e: Event) => void;
  public hasHiddenInput: boolean;
  public hasVisual: boolean;
  public hidden: boolean;
  public iframeElement: HTMLIFrameElement | null;
  public iframeHTML: string;
  public initialized: boolean;
  public notificationManager: NotificationManager;
  public orgDisplay: string;
  public orgVisibility: string;
  public parser: DomParser;
  public quirks: Quirks;
  public readonly: boolean;
  public removed: boolean;
  public schema: Schema;
  public selection: Selection;
  public serializer: DomSerializer;
  public startContent: string;
  public targetElm: HTMLElement;
  public theme: Theme;
  public undoManager: UndoManager;
  public validate: boolean;
  public windowManager: WindowManager;
  public _beforeUnload: () => void;
  public _eventDispatcher: EventDispatcher<NativeEventMap>;
  public _mceOldSubmit: any;
  public _pendingNativeEvents: string[];
  public _selectionOverrides: SelectionOverrides;
  public _skinLoaded: boolean;

  // EditorObservable patches
  public bindPendingEventDelegates: EditorObservable['bindPendingEventDelegates'];
  public toggleNativeEvent: EditorObservable['toggleNativeEvent'];
  public unbindAllNativeEvents: EditorObservable['unbindAllNativeEvents'];
  public fire: EditorObservable['fire'];
  public on: EditorObservable['on'];
  public off: EditorObservable['off'];
  public once: EditorObservable['once'];
  public hasEventListeners: EditorObservable['hasEventListeners'];

  /**
   * Constructs a editor instance by id.
   *
   * @constructor
   * @method Editor
   * @param {String} id Unique id for the editor.
   * @param {Object} settings Settings for the editor.
   * @param {tinymce.EditorManager} editorManager EditorManager instance.
   */
  public constructor(id: string, settings: RawEditorSettings, editorManager: EditorManager) {
    this.editorManager = editorManager;
    this.documentBaseUrl = editorManager.documentBaseURL;

    // Patch in the EditorObservable functions
    extend(this, EditorObservable);

    this.settings = getEditorSettings(this, id, this.documentBaseUrl, editorManager.defaultSettings, settings);

    if (this.settings.suffix) {
      editorManager.suffix = this.settings.suffix;
    }
    this.suffix = editorManager.suffix;

    if (this.settings.base_url) {
      editorManager._setBaseUrl(this.settings.base_url);
    }
    this.baseUri = editorManager.baseURI;

    if (this.settings.referrer_policy) {
      ScriptLoader.ScriptLoader._setReferrerPolicy(this.settings.referrer_policy);
      DOMUtils.DOM.styleSheetLoader._setReferrerPolicy(this.settings.referrer_policy);
    }

    AddOnManager.languageLoad = this.settings.language_load;
    AddOnManager.baseURL = editorManager.baseURL;

    this.id = id;

    this.setDirty(false);

    this.documentBaseURI = new URI(this.settings.document_base_url, {
      base_uri: this.baseUri
    });
    this.baseURI = this.baseUri;
    this.inline = !!this.settings.inline;

    this.shortcuts = new Shortcuts(this);
    this.editorCommands = new EditorCommands(this);

    if (this.settings.cache_suffix) {
      Env.cacheSuffix = this.settings.cache_suffix.replace(/^[\?\&]+/, '');
    }

    this.ui = {
      registry: registry(),
      styleSheetLoader: undefined
    };

    const self = this;
    const modeInstance = create(self);
    this.mode = modeInstance;
    this.setMode = modeInstance.set;

    // Call setup
    editorManager.fire('SetupEditor', { editor: this });
    this.execCallback('setup', this);

    this.$ = DomQuery.overrideDefaults(() => ({
      context: this.inline ? this.getBody() : this.getDoc(),
      element: this.getBody()
    }));
  }

  /**
   * Renders the editor/adds it to the page.
   *
   * @method render
   */
  public render() {
    Render.render(this);
  }

  /**
   * Focuses/activates the editor. This will set this editor as the activeEditor in the tinymce collection
   * it will also place DOM focus inside the editor.
   *
   * @method focus
   * @param {Boolean} skipFocus Skip DOM focus. Just set is as the active editor.
   */
  public focus(skipFocus?: boolean) {
    EditorFocus.focus(this, skipFocus);
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
   * Executes a legacy callback. This method is useful to call old 2.x option callbacks.
   * There new event model is a better way to add callback so this method might be removed in the future.
   *
   * @method execCallback
   * @param {String} name Name of the callback to execute.
   * @return {Object} Return value passed from callback function.
   */
  public execCallback(name: string, ...x: any[]): any {
    const self = this;
    let callback = self.settings[name], scope;

    if (!callback) {
      return;
    }

    // Look through lookup
    if (self.callbackLookup && (scope = self.callbackLookup[name])) {
      callback = scope.func;
      scope = scope.scope;
    }

    if (typeof callback === 'string') {
      scope = callback.replace(/\.\w+$/, '');
      scope = scope ? resolve(scope) : 0;
      callback = resolve(callback);
      self.callbackLookup = self.callbackLookup || {};
      self.callbackLookup[name] = { func: callback, scope };
    }

    return callback.apply(scope || self, x);
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
   *
   * @method getParam
   * @param {String} name Configruation parameter to retrieve.
   * @param {String} defaultVal Optional default value to return.
   * @param {String} type Optional type parameter.
   * @return {String} Configuration parameter value or default value.
   * @example
   * // Returns a specific config value from the currently active editor
   * var someval = tinymce.activeEditor.getParam('myvalue');
   *
   * // Returns a specific config value from a specific editor instance by id
   * var someval2 = tinymce.get('my_editor').getParam('myvalue');
   */
  public getParam <K extends keyof ParamTypeMap>(name: string, defaultVal: ParamTypeMap[K], type: K): ParamTypeMap[K];
  public getParam <K extends keyof EditorSettings>(name: K, defaultVal?: EditorSettings[K], type?: string): EditorSettings[K];
  public getParam <T>(name: string, defaultVal: T, type: string): T;
  public getParam(name: string, defaultVal?: any, type?: string): any {
    return getParam(this, name, defaultVal, type);
  }

  /**
   * Dispatches out a onNodeChange event to all observers. This method should be called when you
   * need to update the UI states or element path etc.
   *
   * @method nodeChanged
   * @param {Object} args Optional args to pass to NodeChange event handlers.
   */
  public nodeChanged(args?: any) {
    this._nodeChangeDispatcher.nodeChanged(args);
  }

  /**
   * Adds a custom command to the editor, you can also override existing commands with this method.
   * The command that you add can be executed with execCommand.
   *
   * @method addCommand
   * @param {String} name Command name to add/override.
   * @param {addCommandCallback} callback Function to execute when the command occurs.
   * @param {Object} scope Optional scope to execute the function in.
   * @example
   * // Adds a custom command that later can be executed using execCommand
   * tinymce.init({
   *    ...
   *
   *    setup: function(ed) {
   *       // Register example command
   *       ed.addCommand('mycommand', function(ui, v) {
   *          ed.windowManager.alert('Hello world!! Selection: ' + ed.selection.getContent({format: 'text'}));
   *       });
   *    }
   * });
   */
  public addCommand(name: string, callback: EditorCommandCallback, scope?: object) {
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
   * Adds a custom query state command to the editor, you can also override existing commands with this method.
   * The command that you add can be executed with queryCommandState function.
   *
   * @method addQueryStateHandler
   * @param {String} name Command name to add/override.
   * @param {addQueryStateHandlerCallback} callback Function to execute when the command state retrieval occurs.
   * @param {Object} scope Optional scope to execute the function in.
   */
  public addQueryStateHandler(name: string, callback: () => void, scope?: {}) {
    /**
     * Callback function that gets called when a queryCommandState is executed.
     *
     * @callback addQueryStateHandlerCallback
     * @return {Boolean} True/false state if the command is enabled or not like is it bold.
     */
    this.editorCommands.addQueryStateHandler(name, callback, scope);
  }

  /**
   * Adds a custom query value command to the editor, you can also override existing commands with this method.
   * The command that you add can be executed with queryCommandValue function.
   *
   * @method addQueryValueHandler
   * @param {String} name Command name to add/override.
   * @param {addQueryValueHandlerCallback} callback Function to execute when the command value retrieval occurs.
   * @param {Object} scope Optional scope to execute the function in.
   */
  public addQueryValueHandler(name: string, callback: () => string, scope?: {}) {
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
   * editor.addShortcut('ctrl+a', "description of the shortcut", function() {});
   * editor.addShortcut('ctrl+alt+a', "description of the shortcut", function() {});
   * // "meta" maps to Command on Mac and Ctrl on PC
   * editor.addShortcut('meta+a', "description of the shortcut", function() {});
   * // "access" maps to Control+Option on Mac and shift+alt on PC
   * editor.addShortcut('access+a', "description of the shortcut", function() {});
   *
   * editor.addShortcut(
   *  'meta+access+c', 'Opens the code editor dialog.', function () {
   *    editor.execCommand('mceCodeEditor');
   * });
   *
   * editor.addShortcut(
   *  'meta+shift+32', 'Inserts "Hello, World!" for meta+shift+space', function () {
   *    editor.execCommand('mceInsertContent', false, 'Hello, World!');
   * });
   */
  public addShortcut(pattern: string, desc: string, cmdFunc: string | any[] | Function, scope?: {}) {
    this.shortcuts.add(pattern, desc, cmdFunc, scope);
  }

  /**
   * Executes a command on the current instance. These commands can be TinyMCE internal commands prefixed with "mce" or
   * they can be build in browser commands such as "Bold". A compleate list of browser commands is available on MSDN or Mozilla.org.
   * This function will dispatch the execCommand function on each plugin, theme or the execcommand_callback option if none of these
   * return true it will handle the command as a internal browser command.
   *
   * @method execCommand
   * @param {String} cmd Command name to execute, for example mceLink or Bold.
   * @param {Boolean} ui True/false state if a UI (dialog) should be presented or not.
   * @param {mixed} value Optional command value, this can be anything.
   * @param {Object} args Optional arguments object.
   */
  public execCommand(cmd: string, ui?: boolean, value?: any, args?: any): boolean {
    return this.editorCommands.execCommand(cmd, ui, value, args);
  }

  /**
   * Returns a command specific state, for example if bold is enabled or not.
   *
   * @method queryCommandState
   * @param {string} cmd Command to query state from.
   * @return {Boolean} Command specific state, for example if bold is enabled or not.
   */
  public queryCommandState(cmd: string): boolean {
    return this.editorCommands.queryCommandState(cmd);
  }

  /**
   * Returns a command specific value, for example the current font size.
   *
   * @method queryCommandValue
   * @param {string} cmd Command to query value from.
   * @return {Object} Command specific value, for example the current font size.
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
  public show() {
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
      self.fire('show');
    }
  }

  /**
   * Hides the editor and shows any textarea/div that the editor is supposed to replace.
   *
   * @method hide
   */
  public hide() {
    const self = this, doc = self.getDoc();

    if (!self.hidden) {
      // Fixed bug where IE has a blinking cursor left from the editor
      if (ie && doc && !self.inline) {
        doc.execCommand('SelectAll');
      }

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
      self.fire('hide');
    }
  }

  /**
   * Returns true/false if the editor is hidden or not.
   *
   * @method isHidden
   * @return {Boolean} True/false if the editor is hidden or not.
   */
  public isHidden() {
    return !!this.hidden;
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
  public setProgressState(state: boolean, time?: number) {
    this.fire('ProgressState', { state, time });
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
  public load(args?: any): string {
    const self = this;
    let elm = self.getElement(), html;

    if (self.removed) {
      return '';
    }

    if (elm) {
      args = args || {};
      args.load = true;

      const value = NodeType.isTextareaOrInput(elm) ? elm.value : elm.innerHTML;

      html = self.setContent(value, args);
      args.element = elm;

      if (!args.no_events) {
        self.fire('LoadContent', args);
      }

      args.element = elm = null;

      return html;
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
  public save(args?: any): string {
    const self = this;
    let elm = self.getElement(), html, form;

    if (!elm || !self.initialized || self.removed) {
      return;
    }

    args = args || {};
    args.save = true;

    args.element = elm;
    html = args.content = self.getContent(args);

    if (!args.no_events) {
      self.fire('SaveContent', args);
    }

    // Always run this internal event
    if (args.format === 'raw') {
      self.fire('RawSaveContent', args);
    }

    html = args.content;

    if (!NodeType.isTextareaOrInput(elm)) {
      if (args.is_removing || !self.inline) {
        elm.innerHTML = html;
      }

      // Update hidden form element
      if ((form = DOM.getParent(self.id, 'form'))) {
        each(form.elements, function (elm) {
          if (elm.name === self.id) {
            elm.value = html;
            return false;
          }
        });
      }
    } else {
      (elm as any).value = html;
    }

    args.element = elm = null;

    if (args.set_dirty !== false) {
      self.setDirty(false);
    }

    return html;
  }

  /**
   * Sets the specified content to the editor instance, this will cleanup the content before it gets set using
   * the different cleanup rules options.
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
   * tinymce.activeEditor.setContent('<p>Some html</p>', {format: 'html'});
   */
  public setContent (content: string, args?: EditorContent.SetContentArgs): string;
  public setContent (content: Node, args?: EditorContent.SetContentArgs): Node;
  public setContent(content: EditorContent.Content, args?: EditorContent.SetContentArgs): EditorContent.Content {
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
   * tinymce.activeEditor.getContent({format: 'text'});
   *
   * // Get content of a specific editor:
   * tinymce.get('content id').getContent()
   */
  public getContent (args: { format: 'tree' } & EditorContent.GetContentArgs): Node;
  public getContent (args?: EditorContent.GetContentArgs): string;
  public getContent(args?: EditorContent.GetContentArgs): EditorContent.Content {
    return EditorContent.getContent(this, args);
  }

  /**
   * Inserts content at caret position.
   *
   * @method insertContent
   * @param {String} content Content to insert.
   * @param {Object} args Optional args to pass to insert call.
   */
  public insertContent(content: string, args?: any) {
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
  public resetContent(initialContent?: string) {
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
   * The dirty state is automatically set to true if you do modifications to the content in other
   * words when new undo levels is created or if you undo/redo to update the contents of the editor. It will also be set
   * to false if you call editor.save().
   *
   * @method isDirty
   * @return {Boolean} True/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
   * @example
   * if (tinymce.activeEditor.isDirty())
   *     alert("You must save your contents.");
   */
  public isDirty() {
    return !this.isNotDirty;
  }

  /**
   * Explicitly sets the dirty state. This will fire the dirty event if the editor dirty state is changed from false to true
   * by invoking this method.
   *
   * @method setDirty
   * @param {Boolean} state True/false if the editor is considered dirty.
   * @example
   * function ajaxSave() {
   *     var editor = tinymce.get('elm1');
   *
   *     // Save contents using some XHR call
   *     alert(editor.getContent());
   *
   *     editor.setDirty(false); // Force not dirty state
   * }
   */
  public setDirty(state: boolean) {
    const oldState = !this.isNotDirty;

    this.isNotDirty = !state;

    if (state && state !== oldState) {
      this.fire('dirty');
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
      self.container = DOM.get(self.editorContainer || self.id + '_parent');
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
      this.targetElm = DOM.get(this.id);
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
    let elm;

    if (!self.contentWindow) {
      elm = self.iframeElement;

      if (elm) {
        self.contentWindow = elm.contentWindow;
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
    let win;

    if (!self.contentDocument) {
      win = self.getWin();

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
    return this.bodyElement || (doc ? doc.body : null);
  }

  /**
   * URL converter function this gets executed each time a user adds an img, a or
   * any other element that has a URL in it. This will be called both by the DOM and HTML
   * manipulation functions.
   *
   * @method convertURL
   * @param {string} url URL to convert.
   * @param {string} name Attribute name src, href etc.
   * @param {string/HTMLElement} elm Tag name or HTML DOM element depending on HTML or DOM insert.
   * @return {string} Converted URL string.
   */
  public convertURL(url: string, name: string, elm?): string {
    const self = this, settings = self.settings;

    // Use callback instead
    if (settings.urlconverter_callback) {
      return self.execCallback('urlconverter_callback', url, elm, true, name);
    }

    // Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
    if (!settings.convert_urls || (elm && elm.nodeName === 'LINK') || url.indexOf('file:') === 0 || url.length === 0) {
      return url;
    }

    // Convert to relative
    if (settings.relative_urls) {
      return self.documentBaseURI.toRelative(url);
    }

    // Convert to absolute
    url = self.documentBaseURI.toAbsolute(url, settings.remove_script_host);

    return url;
  }

  /**
   * Adds visual aid for tables, anchors etc so they can be more easily edited inside the editor.
   *
   * @method addVisual
   * @param {Element} elm Optional root element to loop though to find tables etc that needs the visual aid.
   */
  public addVisual(elm?: HTMLElement) {
    const self = this;
    const settings = self.settings;
    const dom: DOMUtils = self.dom;
    let cls;

    elm = elm || self.getBody();

    if (self.hasVisual === undefined) {
      self.hasVisual = settings.visual;
    }

    each(dom.select('table,a', elm), function (elm) {
      let value;

      switch (elm.nodeName) {
        case 'TABLE':
          cls = settings.visual_table_class || 'mce-item-table';
          value = dom.getAttrib(elm, 'border');

          if ((!value || value === '0') && self.hasVisual) {
            dom.addClass(elm, cls);
          } else {
            dom.removeClass(elm, cls);
          }

          return;

        case 'A':
          if (!dom.getAttrib(elm, 'href')) {
            value = dom.getAttrib(elm, 'name') || elm.id;
            cls = settings.visual_anchor_class || 'mce-item-anchor';

            if (value && self.hasVisual) {
              dom.addClass(elm, cls);
            } else {
              dom.removeClass(elm, cls);
            }
          }

          return;
      }
    });

    self.fire('VisualAid', { element: elm, hasVisual: self.hasVisual });
  }

  /**
   * Removes the editor from the dom and tinymce collection.
   *
   * @method remove
   */
  public remove() {
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
  public destroy(automatic?: boolean) {
    EditorRemove.destroy(this, automatic);
  }

  /**
   * Uploads all data uri/blob uri images in the editor contents to server.
   *
   * @method uploadImages
   * @param {function} callback Optional callback with images and status for each image.
   * @return {Promise} Promise instance.
   */
  public uploadImages(callback?: UploadCallback): Promise<UploadResult[]> {
    return this.editorUpload.uploadImages(callback);
  }

  // Internal functions

  public _scanForImages(): Promise<BlobInfoImagePair[]> {
    return this.editorUpload.scanForImages();
  }

  /**
   * No longer supported, use editor.ui.registry.addButton instead
   */
  public addButton() {
    throw new Error('editor.addButton has been removed in tinymce 5x, use editor.ui.registry.addButton or editor.ui.registry.addToggleButton or editor.ui.registry.addSplitButton instead');
  }

  /**
   * No longer supported, use editor.ui.registry.addSidebar instead
   */
  public addSidebar() {
    throw new Error('editor.addSidebar has been removed in tinymce 5x, use editor.ui.registry.addSidebar instead');
  }

  /**
   * No longer supported, use editor.ui.registry.addMenuItem instead
   */
  public addMenuItem() {
    throw new Error('editor.addMenuItem has been removed in tinymce 5x, use editor.ui.registry.addMenuItem instead');
  }

  /**
   * No longer supported, use editor.ui.registry.addContextMenu instead
   */
  public addContextToolbar() {
    throw new Error('editor.addContextToolbar has been removed in tinymce 5x, use editor.ui.registry.addContextToolbar instead');
  }
}

export default Editor;
