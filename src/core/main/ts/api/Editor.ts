/**
 * Editor.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { AddOnManager } from './AddOnManager';
import EditorCommands from './EditorCommands';
import EditorObservable from './EditorObservable';
import { ParamTypeMap, getEditorSettings, getParam } from '../EditorSettings';
import Env from './Env';
import * as Mode from '../Mode';
import Shortcuts from './Shortcuts';
import DOMUtils from './dom/DOMUtils';
import DomQuery from './dom/DomQuery';
import EditorFocus from '../focus/EditorFocus';
import Render from '../init/Render';
import Sidebar from '../ui/Sidebar';
import Tools from './util/Tools';
import URI from './util/URI';
import Uuid from '../util/Uuid';
import { Selection } from 'tinymce/core/api/dom/Selection';
import * as EditorContent from 'tinymce/core/content/EditorContent';
import * as EditorRemove from '../EditorRemove';
import SelectionOverrides from 'tinymce/core/SelectionOverrides';
import Schema from 'tinymce/core/api/html/Schema';
import { UndoManager } from 'tinymce/core/api/UndoManager';
import { Annotator } from 'tinymce/core/api/Annotator';
import { HTMLElement, Document, Window, Element, HTMLInputElement, HTMLTextAreaElement } from '@ephox/dom-globals';

/**
 * Include the base event class documentation.
 *
 * @include ../../../../../tools/docs/tinymce.Event.js
 */

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

export type AnyFunction = (...x: any[]) => any;

export interface Editor {
  $: any;
  annotator: Annotator;
  baseURI: any;
  bodyElement: HTMLElement;
  bookmark: any;
  buttons: any;
  composing: boolean;
  container: HTMLElement;
  contentAreaContainer: any;
  contentCSS: any;
  contentDocument: Document;
  contentStyles: any;
  contentWindow: Window;
  contextToolbars: any;
  delegates: any;
  destroyed: boolean;
  documentBaseURI: any;
  documentBaseUrl: string;
  dom: DOMUtils;
  editorCommands: any;
  editorContainer: any;
  editorManager: any;
  editorUpload: any;
  eventRoot?: HTMLElement;
  formatter: any;
  formElement: HTMLElement;
  formEventDelegate: any;
  hasHiddenInput: boolean;
  hasVisual: boolean;
  hidden: boolean;
  id: string;
  iframeElement: any;
  iframeHTML: string;
  initialized: boolean;
  inline: boolean;
  isNotDirty: boolean;
  loadedCSS: any;
  menuItems: any;
  notificationManager: any;
  orgDisplay: string;
  orgVisibility: string;
  parser: any;
  plugins: any;
  quirks: any;
  readonly: boolean;
  removed: boolean;
  rtl: boolean;
  schema: Schema;
  selection: Selection;
  serializer: any;
  settings: Record<string, any>;
  shortcuts: any;
  startContent: string;
  suffix: string;
  targetElm: HTMLElement;
  theme: any;
  undoManager: UndoManager;
  validate: boolean;
  windowManager: any;
  _beforeUnload: AnyFunction;
  _eventDispatcher: any;
  _mceOldSubmit: any;
  _nodeChangeDispatcher: any;
  _pendingNativeEvents: any;
  _selectionOverrides: SelectionOverrides;
  _skinLoaded: boolean;

  addButton(name: string, settings): void;
  addCommand(name: string, callback, scope?: object): void;
  addContextToolbar(predicate, items): void;
  addMenuItem(name: string, settings): void;
  addQueryStateHandler(name: string, callback, scope?: object): void;
  addQueryValueHandler(name: string, callback, scope?: object): void;
  addShortcut(pattern: string, desc: string, cmdFunc, scope?: object): void;
  addSidebar(name: string, settings): void;
  addVisual(elm?): void;
  bindPendingEventDelegates(): void;
  convertURL(url: string, name: string, elm?): string;
  destroy(automatic?: boolean): void;
  execCallback(name: string, ...x: any[]): any;
  execCommand(cmd: string, ui?: boolean, value?: any, args?): any;
  fire(name: string, args?, bubble?: boolean): any;
  focus(skipFocus?: boolean): any;
  getBody(): HTMLElement;
  getContainer(): HTMLElement;
  getContent(args?: EditorContent.GetContentArgs): EditorContent.Content;
  getContentAreaContainer(): HTMLElement;
  getDoc(): Document;
  getElement(): HTMLElement;
  getLang(name: string, defaultVal): any;
  getParam<K extends keyof ParamTypeMap>(name: string, defaultVal: ParamTypeMap[K], type: K): ParamTypeMap[K];
  getParam<T>(name: string, defaultVal: T, type: string): T;
  getParam(name: string, defaultVal?: any, type?: string): any;
  getWin(): Window;
  hasEventListeners(name: string): boolean;
  hide(): void;
  insertContent(content, args?): void;
  isDirty(): boolean;
  isHidden(): boolean;
  load(args?): string;
  nodeChanged(args?): void;
  off(name: string, callback?): any;
  on(name: string, callback, prepend?): any;
  once(name: string, callback): any;
  queryCommandState(cmd: string): boolean;
  queryCommandSupported(cmd: string): boolean;
  queryCommandValue(cmd: string): any;
  remove(): void;
  render(): void;
  save(args?: SaveArgs): void;
  setContent(content: EditorContent.Content, args?: EditorContent.SetContentArgs): void;
  setDirty(state: boolean): void;
  setMode(mode: string): void;
  setProgressState(state: boolean, time?: number): void;
  show(): void;
  toggleNativeEvent(name: string, state): void;
  translate(text: string): string;
  unbindAllNativeEvents(): void;
  uploadImages(callback): void;
  _scanForImages(): void;
}

export interface SaveArgs {
  is_removing?: boolean;
  save?: boolean;
  element?: Element;
  content?: any;
  no_events?: boolean;
  format?: 'raw';
  set_dirty?: boolean;
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

/**
 * Constructs a editor instance by id.
 *
 * @constructor
 * @method Editor
 * @param {String} id Unique id for the editor.
 * @param {Object} settings Settings for the editor.
 * @param {tinymce.EditorManager} editorManager EditorManager instance.
 */
export const Editor = function (id, settings, editorManager) {
  const self = this;
  const documentBaseUrl = self.documentBaseUrl = editorManager.documentBaseURL;
  const baseUri = editorManager.baseURI;

  /**
   * Name/value collection with editor settings.
   *
   * @property settings
   * @type Object
   * @example
   * // Get the value of the theme setting
   * tinymce.activeEditor.windowManager.alert("You are using the " + tinymce.activeEditor.settings.theme + " theme");
   */
  settings = getEditorSettings(self, id, documentBaseUrl, editorManager.defaultSettings, settings);
  self.settings = settings;

  AddOnManager.language = settings.language || 'en';
  AddOnManager.languageLoad = settings.language_load;
  AddOnManager.baseURL = editorManager.baseURL;

  /**
   * Editor instance id, normally the same as the div/textarea that was replaced.
   *
   * @property id
   * @type String
   */
  self.id = id;

  /**
   * State to force the editor to return false on a isDirty call.
   *
   * @property isNotDirty
   * @type Boolean
   * @deprecated Use editor.setDirty instead.
   */
  self.setDirty(false);

  /**
   * Name/Value object containing plugin instances.
   *
   * @property plugins
   * @type Object
   * @example
   * // Execute a method inside a plugin directly
   * tinymce.activeEditor.plugins.someplugin.someMethod();
   */
  self.plugins = {};

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
  self.documentBaseURI = new URI(settings.document_base_url, {
    base_uri: baseUri
  });

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
  self.baseURI = baseUri;

  /**
   * Array with CSS files to load into the iframe.
   *
   * @property contentCSS
   * @type Array
   */
  self.contentCSS = [];

  /**
   * Array of CSS styles to add to head of document when the editor loads.
   *
   * @property contentStyles
   * @type Array
   */
  self.contentStyles = [];

  self.shortcuts = new Shortcuts(self);
  self.loadedCSS = {};
  self.editorCommands = new EditorCommands(self);
  self.suffix = editorManager.suffix;
  self.editorManager = editorManager;
  self.inline = settings.inline;
  self.buttons = {};
  self.menuItems = {};

  if (settings.cache_suffix) {
    Env.cacheSuffix = settings.cache_suffix.replace(/^[\?\&]+/, '');
  }

  if (settings.override_viewport === false) {
    Env.overrideViewPort = false;
  }

  // Call setup
  editorManager.fire('SetupEditor', { editor: self });
  self.execCallback('setup', self);

  /**
   * Dom query instance with default scope to the editor document and default element is the body of the editor.
   *
   * @property $
   * @type tinymce.dom.DomQuery
   * @example
   * tinymce.activeEditor.$('p').css('color', 'red');
   * tinymce.activeEditor.$().append('<p>new</p>');
   */
  self.$ = DomQuery.overrideDefaults(function () {
    return {
      context: self.inline ? self.getBody() : self.getDoc(),
      element: self.getBody()
    };
  });
};

Editor.prototype = {
  /**
   * Renders the editor/adds it to the page.
   *
   * @method render
   */
  render () {
    Render.render(this);
  },

  /**
   * Focuses/activates the editor. This will set this editor as the activeEditor in the tinymce collection
   * it will also place DOM focus inside the editor.
   *
   * @method focus
   * @param {Boolean} skipFocus Skip DOM focus. Just set is as the active editor.
   */
  focus (skipFocus) {
    EditorFocus.focus(this, skipFocus);
  },

  /**
   * Returns true/false if the editor has real keyboard focus.
   *
   * @method hasFocus
   * @return {Boolean} Current focus state of the editor.
   */
  hasFocus () {
    return EditorFocus.hasFocus(this);
  },

  /**
   * Executes a legacy callback. This method is useful to call old 2.x option callbacks.
   * There new event model is a better way to add callback so this method might be removed in the future.
   *
   * @method execCallback
   * @param {String} name Name of the callback to execute.
   * @return {Object} Return value passed from callback function.
   */
  execCallback (name, ...x: any[]) {
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

    return callback.apply(scope || self, Array.prototype.slice.call(arguments, 1));
  },

  /**
   * Translates the specified string by replacing variables with language pack items it will also check if there is
   * a key matching the input.
   *
   * @method translate
   * @param {String} text String to translate by the language pack data.
   * @return {String} Translated string.
   */
  translate (text) {
    if (text && Tools.is(text, 'string')) {
      const lang = this.settings.language || 'en', i18n = this.editorManager.i18n;

      text = i18n.data[lang + '.' + text] || text.replace(/\{\#([^\}]+)\}/g, function (a, b) {
        return i18n.data[lang + '.' + b] || '{#' + b + '}';
      });
    }

    return this.editorManager.translate(text);
  },

  /**
   * Returns a language pack item by name/key.
   *
   * @method getLang
   * @param {String} name Name/key to get from the language pack.
   * @param {String} defaultVal Optional default value to retrieve.
   */
  getLang (name, defaultVal) {
    return (
      this.editorManager.i18n.data[(this.settings.language || 'en') + '.' + name] ||
      (defaultVal !== undefined ? defaultVal : '{#' + name + '}')
    );
  },

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
  getParam (name: string, defaultVal?: any, type?: string): any {
    return getParam(this, name, defaultVal, type);
  },

  /**
   * Dispatches out a onNodeChange event to all observers. This method should be called when you
   * need to update the UI states or element path etc.
   *
   * @method nodeChanged
   * @param {Object} args Optional args to pass to NodeChange event handlers.
   */
  nodeChanged (args) {
    this._nodeChangeDispatcher.nodeChanged(args);
  },

  /**
   * Adds a button that later gets created by the theme in the editors toolbars.
   *
   * @method addButton
   * @param {String} name Button name to add.
   * @param {Object} settings Settings object with title, cmd etc.
   * @example
   * // Adds a custom button to the editor that inserts contents when clicked
   * tinymce.init({
   *    ...
   *
   *    toolbar: 'example'
   *
   *    setup: function(ed) {
   *       ed.addButton('example', {
   *          title: 'My title',
   *          image: '../js/tinymce/plugins/example/img/example.gif',
   *          onclick: function() {
   *             ed.insertContent('Hello world!!');
   *          }
   *       });
   *    }
   * });
   */
  addButton (name, settings) {
    const self = this;

    if (settings.cmd) {
      settings.onclick = function () {
        self.execCommand(settings.cmd);
      };
    }

    if (settings.stateSelector && typeof settings.active === 'undefined') {
      settings.active = false;
    }

    if (!settings.text && !settings.icon) {
      settings.icon = name;
    }

    self.buttons = self.buttons;
    settings.tooltip = settings.tooltip || settings.title;
    self.buttons[name] = settings;
  },

  /**
   * Adds a sidebar for the editor instance.
   *
   * @method addSidebar
   * @param {String} name Sidebar name to add.
   * @param {Object} settings Settings object with icon, onshow etc.
   * @example
   * // Adds a custom sidebar that when clicked logs the panel element
   * tinymce.init({
   *    ...
   *    setup: function(ed) {
   *       ed.addSidebar('example', {
   *          tooltip: 'My sidebar',
   *          icon: 'my-side-bar',
   *          onshow: function(api) {
   *             console.log(api.element());
   *          }
   *       });
   *    }
   * });
   */
  addSidebar (name, settings) {
    return Sidebar.add(this, name, settings);
  },

  /**
   * Adds a menu item to be used in the menus of the theme. There might be multiple instances
   * of this menu item for example it might be used in the main menus of the theme but also in
   * the context menu so make sure that it's self contained and supports multiple instances.
   *
   * @method addMenuItem
   * @param {String} name Menu item name to add.
   * @param {Object} settings Settings object with title, cmd etc.
   * @example
   * // Adds a custom menu item to the editor that inserts contents when clicked
   * // The context option allows you to add the menu item to an existing default menu
   * tinymce.init({
   *    ...
   *
   *    setup: function(ed) {
   *       ed.addMenuItem('example', {
   *          text: 'My menu item',
   *          context: 'tools',
   *          onclick: function() {
   *             ed.insertContent('Hello world!!');
   *          }
   *       });
   *    }
   * });
   */
  addMenuItem (name, settings) {
    const self = this;

    if (settings.cmd) {
      settings.onclick = function () {
        self.execCommand(settings.cmd);
      };
    }

    self.menuItems = self.menuItems;
    self.menuItems[name] = settings;
  },

  /**
   * Adds a contextual toolbar to be rendered when the selector matches.
   *
   * @method addContextToolbar
   * @param {function/string} predicate Predicate that needs to return true if provided strings get converted into CSS predicates.
   * @param {String/Array} items String or array with items to add to the context toolbar.
   */
  addContextToolbar (predicate, items) {
    const self = this;
    let selector;

    self.contextToolbars = self.contextToolbars || [];

    // Convert selector to predicate
    if (typeof predicate === 'string') {
      selector = predicate;
      predicate = function (elm) {
        return self.dom.is(elm, selector);
      };
    }

    self.contextToolbars.push({
      id: Uuid.uuid('mcet'),
      predicate,
      items
    });
  },

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
  addCommand (name, callback, scope) {
    /**
     * Callback function that gets called when a command is executed.
     *
     * @callback addCommandCallback
     * @param {Boolean} ui Display UI state true/false.
     * @param {Object} value Optional value for command.
     * @return {Boolean} True/false state if the command was handled or not.
     */
    this.editorCommands.addCommand(name, callback, scope);
  },

  /**
   * Adds a custom query state command to the editor, you can also override existing commands with this method.
   * The command that you add can be executed with queryCommandState function.
   *
   * @method addQueryStateHandler
   * @param {String} name Command name to add/override.
   * @param {addQueryStateHandlerCallback} callback Function to execute when the command state retrieval occurs.
   * @param {Object} scope Optional scope to execute the function in.
   */
  addQueryStateHandler (name, callback, scope) {
    /**
     * Callback function that gets called when a queryCommandState is executed.
     *
     * @callback addQueryStateHandlerCallback
     * @return {Boolean} True/false state if the command is enabled or not like is it bold.
     */
    this.editorCommands.addQueryStateHandler(name, callback, scope);
  },

  /**
   * Adds a custom query value command to the editor, you can also override existing commands with this method.
   * The command that you add can be executed with queryCommandValue function.
   *
   * @method addQueryValueHandler
   * @param {String} name Command name to add/override.
   * @param {addQueryValueHandlerCallback} callback Function to execute when the command value retrieval occurs.
   * @param {Object} scope Optional scope to execute the function in.
   */
  addQueryValueHandler (name, callback, scope) {
    /**
     * Callback function that gets called when a queryCommandValue is executed.
     *
     * @callback addQueryValueHandlerCallback
     * @return {Object} Value of the command or undefined.
     */
    this.editorCommands.addQueryValueHandler(name, callback, scope);
  },

  /**
   * Adds a keyboard shortcut for some command or function.
   *
   * @method addShortcut
   * @param {String} pattern Shortcut pattern. Like for example: ctrl+alt+o.
   * @param {String} desc Text description for the command.
   * @param {String/Function} cmdFunc Command name string or function to execute when the key is pressed.
   * @param {Object} sc Optional scope to execute the function in.
   * @return {Boolean} true/false state if the shortcut was added or not.
   */
  addShortcut (pattern, desc, cmdFunc, scope) {
    this.shortcuts.add(pattern, desc, cmdFunc, scope);
  },

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
  execCommand (cmd, ui, value, args) {
    return this.editorCommands.execCommand(cmd, ui, value, args);
  },

  /**
   * Returns a command specific state, for example if bold is enabled or not.
   *
   * @method queryCommandState
   * @param {string} cmd Command to query state from.
   * @return {Boolean} Command specific state, for example if bold is enabled or not.
   */
  queryCommandState (cmd) {
    return this.editorCommands.queryCommandState(cmd);
  },

  /**
   * Returns a command specific value, for example the current font size.
   *
   * @method queryCommandValue
   * @param {string} cmd Command to query value from.
   * @return {Object} Command specific value, for example the current font size.
   */
  queryCommandValue (cmd) {
    return this.editorCommands.queryCommandValue(cmd);
  },

  /**
   * Returns true/false if the command is supported or not.
   *
   * @method queryCommandSupported
   * @param {String} cmd Command that we check support for.
   * @return {Boolean} true/false if the command is supported or not.
   */
  queryCommandSupported (cmd) {
    return this.editorCommands.queryCommandSupported(cmd);
  },

  /**
   * Shows the editor and hides any textarea/div that the editor is supposed to replace.
   *
   * @method show
   */
  show () {
    const self = this;

    if (self.hidden) {
      self.hidden = false;

      if (self.inline) {
        self.getBody().contentEditable = true;
      } else {
        DOM.show(self.getContainer());
        DOM.hide(self.id);
      }

      self.load();
      self.fire('show');
    }
  },

  /**
   * Hides the editor and shows any textarea/div that the editor is supposed to replace.
   *
   * @method hide
   */
  hide () {
    const self = this, doc = self.getDoc();

    if (!self.hidden) {
      // Fixed bug where IE has a blinking cursor left from the editor
      if (ie && doc && !self.inline) {
        doc.execCommand('SelectAll');
      }

      // We must save before we hide so Safari doesn't crash
      self.save();

      if (self.inline) {
        self.getBody().contentEditable = false;

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
  },

  /**
   * Returns true/false if the editor is hidden or not.
   *
   * @method isHidden
   * @return {Boolean} True/false if the editor is hidden or not.
   */
  isHidden () {
    return !!this.hidden;
  },

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
  setProgressState (state, time) {
    this.fire('ProgressState', { state, time });
  },

  /**
   * Loads contents from the textarea or div element that got converted into an editor instance.
   * This method will move the contents from that textarea or div into the editor by using setContent
   * so all events etc that method has will get dispatched as well.
   *
   * @method load
   * @param {Object} args Optional content object, this gets passed around through the whole load process.
   * @return {String} HTML string that got set into the editor.
   */
  load (args) {
    const self = this;
    let elm = self.getElement(), html;

    if (self.removed) {
      return '';
    }

    if (elm) {
      args = args || {};
      args.load = true;

      html = self.setContent(elm.value !== undefined ? elm.value : elm.innerHTML, args);
      args.element = elm;

      if (!args.no_events) {
        self.fire('LoadContent', args);
      }

      args.element = elm = null;

      return html;
    }
  },

  /**
   * Saves the contents from a editor out to the textarea or div element that got converted into an editor instance.
   * This method will move the HTML contents from the editor into that textarea or div by getContent
   * so all events etc that method has will get dispatched as well.
   *
   * @method save
   * @param {Object} args Optional content object, this gets passed around through the whole save process.
   * @return {String} HTML string that got set into the textarea/div.
   */
  save (args: SaveArgs) {
    const self: Editor = this;
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

    if (!/TEXTAREA|INPUT/i.test(elm.nodeName)) {
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
      (elm as HTMLInputElement | HTMLTextAreaElement).value = html;
    }

    args.element = elm = null;

    if (args.set_dirty !== false) {
      self.setDirty(false);
    }

    return html;
  },

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
   * // Sets the raw contents of the activeEditor editor
   * tinymce.activeEditor.setContent('<span>some</span> html', {format: 'raw'});
   *
   * // Sets the content of a specific editor (my_editor in this example)
   * tinymce.get('my_editor').setContent(data);
   *
   * // Sets the bbcode contents of the activeEditor editor if the bbcode plugin was added
   * tinymce.activeEditor.setContent('[b]some[/b] html', {format: 'bbcode'});
   */
  setContent (content: EditorContent.Content, args?: EditorContent.SetContentArgs): EditorContent.Content {
    return EditorContent.setContent(this, content, args);
  },

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
   * // Get the raw contents of the currently active editor
   * tinymce.activeEditor.getContent({format: 'raw'});
   *
   * // Get content of a specific editor:
   * tinymce.get('content id').getContent()
   */
  getContent (args?: EditorContent.GetContentArgs): EditorContent.Content {
    return EditorContent.getContent(this, args);
  },

  /**
   * Inserts content at caret position.
   *
   * @method insertContent
   * @param {String} content Content to insert.
   * @param {Object} args Optional args to pass to insert call.
   */
  insertContent (content, args) {
    if (args) {
      content = extend({ content }, args);
    }

    this.execCommand('mceInsertContent', false, content);
  },

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
  isDirty () {
    return !this.isNotDirty;
  },

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
  setDirty (state) {
    const oldState = !this.isNotDirty;

    this.isNotDirty = !state;

    if (state && state !== oldState) {
      this.fire('dirty');
    }
  },

  /**
   * Sets the editor mode. Mode can be for example "design", "code" or "readonly".
   *
   * @method setMode
   * @param {String} mode Mode to set the editor in.
   */
  setMode (mode) {
    Mode.setMode(this, mode);
  },

  /**
   * Returns the editors container element. The container element wrappes in
   * all the elements added to the page for the editor. Such as UI, iframe etc.
   *
   * @method getContainer
   * @return {Element} HTML DOM element for the editor container.
   */
  getContainer () {
    const self = this;

    if (!self.container) {
      self.container = DOM.get(self.editorContainer || self.id + '_parent');
    }

    return self.container;
  },

  /**
   * Returns the editors content area container element. The this element is the one who
   * holds the iframe or the editable element.
   *
   * @method getContentAreaContainer
   * @return {Element} HTML DOM element for the editor area container.
   */
  getContentAreaContainer () {
    return this.contentAreaContainer;
  },

  /**
   * Returns the target element/textarea that got replaced with a TinyMCE editor instance.
   *
   * @method getElement
   * @return {Element} HTML DOM element for the replaced element.
   */
  getElement () {
    if (!this.targetElm) {
      this.targetElm = DOM.get(this.id);
    }

    return this.targetElm;
  },

  /**
   * Returns the iframes window object.
   *
   * @method getWin
   * @return {Window} Iframe DOM window object.
   */
  getWin () {
    const self = this;
    let elm;

    if (!self.contentWindow) {
      elm = self.iframeElement;

      if (elm) {
        self.contentWindow = elm.contentWindow;
      }
    }

    return self.contentWindow;
  },

  /**
   * Returns the iframes document object.
   *
   * @method getDoc
   * @return {Document} Iframe DOM document object.
   */
  getDoc () {
    const self = this;
    let win;

    if (!self.contentDocument) {
      win = self.getWin();

      if (win) {
        self.contentDocument = win.document;
      }
    }

    return self.contentDocument;
  },

  /**
   * Returns the root element of the editable area.
   * For a non-inline iframe-based editor, returns the iframe's body element.
   *
   * @method getBody
   * @return {Element} The root element of the editable area.
   */
  getBody () {
    const doc = this.getDoc();
    return this.bodyElement || (doc ? doc.body : null);
  },

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
  convertURL (url, name, elm) {
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
  },

  /**
   * Adds visual aid for tables, anchors etc so they can be more easily edited inside the editor.
   *
   * @method addVisual
   * @param {Element} elm Optional root element to loop though to find tables etc that needs the visual aid.
   */
  addVisual (elm) {
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
  },

  /**
   * Removes the editor from the dom and tinymce collection.
   *
   * @method remove
   */
  remove () {
    EditorRemove.remove(this);
  },

  /**
   * Destroys the editor instance by removing all events, element references or other resources
   * that could leak memory. This method will be called automatically when the page is unloaded
   * but you can also call it directly if you know what you are doing.
   *
   * @method destroy
   * @param {Boolean} automatic Optional state if the destroy is an automatic destroy or user called one.
   */
  destroy (automatic?: boolean) {
    EditorRemove.destroy(this, automatic);
  },

  /**
   * Uploads all data uri/blob uri images in the editor contents to server.
   *
   * @method uploadImages
   * @param {function} callback Optional callback with images and status for each image.
   * @return {tinymce.util.Promise} Promise instance.
   */
  uploadImages (callback) {
    return this.editorUpload.uploadImages(callback);
  },

  // Internal functions

  _scanForImages () {
    return this.editorUpload.scanForImages();
  }
};

extend(Editor.prototype, EditorObservable);
