import { Arr, Obj, Type } from '@ephox/katamari';

import * as ErrorReporter from '../ErrorReporter';
import * as FocusController from '../focus/FocusController';
import AddOnManager from './AddOnManager';
import DOMUtils from './dom/DOMUtils';
import { EventUtilsEvent } from './dom/EventUtils';
import Editor from './Editor';
import Env from './Env';
import { EditorManagerEventMap } from './EventTypes';
import { RawEditorOptions } from './OptionTypes';
import I18n, { TranslatedString, Untranslated } from './util/I18n';
import Observable from './util/Observable';
import Tools from './util/Tools';
import URI from './util/URI';

interface PreInit {
  suffix: string;
  baseURL: string;
  base?: string;
}

declare const window: Window & { tinymce?: PreInit; tinyMCEPreInit?: PreInit };

const DOM = DOMUtils.DOM;
const each = Tools.each;
let boundGlobalEvents = false;
let beforeUnloadDelegate: (e: BeforeUnloadEvent) => any;
let editors: Editor[] = [];

const globalEventDelegate = (e: EventUtilsEvent<UIEvent | Event>): void => {
  const type = e.type;
  each(EditorManager.get(), (editor) => {
    switch (type) {
      case 'scroll':
        editor.dispatch('ScrollWindow', e);
        break;
      case 'resize':
        editor.dispatch('ResizeWindow', e as EventUtilsEvent<UIEvent>);
        break;
    }
  });
};

const toggleGlobalEvents = (state: boolean) => {
  if (state !== boundGlobalEvents) {
    const DOM = DOMUtils.DOM;
    if (state) {
      DOM.bind(window, 'resize', globalEventDelegate);
      DOM.bind(window, 'scroll', globalEventDelegate);
    } else {
      DOM.unbind(window, 'resize', globalEventDelegate);
      DOM.unbind(window, 'scroll', globalEventDelegate);
    }

    boundGlobalEvents = state;
  }
};

const removeEditorFromList = (targetEditor: Editor) => {
  const oldEditors = editors;

  editors = Arr.filter(editors, (editor) => {
    return targetEditor !== editor;
  });

  // Select another editor since the active one was removed
  if (EditorManager.activeEditor === targetEditor) {
    EditorManager.activeEditor = editors.length > 0 ? editors[0] : null;
  }

  // Clear focusedEditor if necessary, so that we don't try to blur the destroyed editor
  if (EditorManager.focusedEditor === targetEditor) {
    EditorManager.focusedEditor = null;
  }

  return oldEditors.length !== editors.length;
};

const purgeDestroyedEditor = (editor: Editor | null): void => {
  // User has manually destroyed the editor lets clean up the mess
  if (editor && editor.initialized && !(editor.getContainer() || editor.getBody()).parentNode) {
    removeEditorFromList(editor);
    editor.unbindAllNativeEvents();
    editor.destroy(true);
    editor.removed = true;
  }
};

interface EditorManager extends Observable<EditorManagerEventMap> {
  defaultOptions: RawEditorOptions;
  majorVersion: string;
  minorVersion: string;
  releaseDate: string;
  activeEditor: Editor | null;
  focusedEditor: Editor | null;
  baseURI: URI;
  baseURL: string;
  documentBaseURL: string;
  i18n: I18n;
  suffix: string;

  add (this: EditorManager, editor: Editor): Editor;
  addI18n: (code: string, item: Record<string, string>) => void;
  createEditor (this: EditorManager, id: string, options: RawEditorOptions): Editor;
  execCommand (this: EditorManager, cmd: string, ui: boolean, value: any): boolean;
  get (this: EditorManager): Editor[];
  get (this: EditorManager, id: number | string): Editor | null;
  init (this: EditorManager, options: RawEditorOptions): Promise<Editor[]>;
  overrideDefaults (this: EditorManager, defaultOptions: Partial<RawEditorOptions>): void;
  remove (this: EditorManager): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  remove (this: EditorManager, selector: string): void;
  remove (this: EditorManager, editor: Editor): Editor | null;
  setActive (this: EditorManager, editor: Editor): void;
  setup (this: EditorManager): void;
  translate: (text: Untranslated) => TranslatedString;
  triggerSave: () => void;
  _setBaseUrl (this: EditorManager, baseUrl: string): void;
}

const isQuirksMode = document.compatMode !== 'CSS1Compat';

const EditorManager: EditorManager = {
  ...Observable,

  baseURI: null as any,
  baseURL: null as any,

  /**
   * Object containing the options that will be passed by default to the <code>init</code> method upon each initialization of an editor. These defaults will be shallow merged with other options passed to <code>init</code>.
   *
   * @property defaultOptions
   * @type Object
   */
  defaultOptions: {},

  documentBaseURL: null as any,
  suffix: null as any,

  /**
   * Major version of TinyMCE build.
   *
   * @property majorVersion
   * @type String
   */
  majorVersion: '@@majorVersion@@',

  /**
   * Minor version of TinyMCE build.
   *
   * @property minorVersion
   * @type String
   */
  minorVersion: '@@minorVersion@@',

  /**
   * Release date of TinyMCE build.
   *
   * @property releaseDate
   * @type String
   */
  releaseDate: '@@releaseDate@@',

  /**
   * Collection of language pack data.
   *
   * @property i18n
   * @type Object
   */
  i18n: I18n,

  /**
   * Currently active editor instance.
   *
   * @property activeEditor
   * @type tinymce.Editor
   * @example
   * tinyMCE.activeEditor.selection.getContent();
   * tinymce.EditorManager.activeEditor.selection.getContent();
   */
  activeEditor: null,
  focusedEditor: null,

  setup() {
    const self = this;
    let baseURL = '';
    let suffix = '';

    // Get base URL for the current document
    let documentBaseURL = URI.getDocumentBaseUrl(document.location);

    // Check if the URL is a document based format like: http://site/dir/file and file:///
    // leave other formats like applewebdata://... intact
    if (/^[^:]+:\/\/\/?[^\/]+\//.test(documentBaseURL)) {
      documentBaseURL = documentBaseURL.replace(/[\?#].*$/, '').replace(/[\/\\][^\/]+$/, '');

      if (!/[\/\\]$/.test(documentBaseURL)) {
        documentBaseURL += '/';
      }
    }

    // If tinymce is defined and has a base use that or use the old tinyMCEPreInit
    const preInit = window.tinymce || window.tinyMCEPreInit;
    if (preInit) {
      baseURL = preInit.base || preInit.baseURL;
      suffix = preInit.suffix;
    } else {
      // Get base where the tinymce script is located
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src || '';
        if (src === '') {
          continue;
        }

        // Script types supported:
        // tinymce.js tinymce.min.js tinymce.dev.js
        // tinymce.jquery.js tinymce.jquery.min.js tinymce.jquery.dev.js
        // tinymce.full.js tinymce.full.min.js tinymce.full.dev.js
        const srcScript = src.substring(src.lastIndexOf('/'));
        if (/tinymce(\.full|\.jquery|)(\.min|\.dev|)\.js/.test(src)) {
          if (srcScript.indexOf('.min') !== -1) {
            suffix = '.min';
          }

          baseURL = src.substring(0, src.lastIndexOf('/'));
          break;
        }
      }

      // We didn't find any baseURL by looking at the script elements
      // Try to use the document.currentScript as a fallback
      if (!baseURL && document.currentScript) {
        const src = (document.currentScript as HTMLScriptElement).src;

        if (src.indexOf('.min') !== -1) {
          suffix = '.min';
        }

        baseURL = src.substring(0, src.lastIndexOf('/'));
      }
    }

    /**
     * Base URL where the root directory if TinyMCE is located.
     *
     * @property baseURL
     * @type String
     */
    self.baseURL = new URI(documentBaseURL).toAbsolute(baseURL);

    /**
     * Document base URL where the current document is located.
     *
     * @property documentBaseURL
     * @type String
     */
    self.documentBaseURL = documentBaseURL;

    /**
     * Absolute baseURI for the installation path of TinyMCE.
     *
     * @property baseURI
     * @type tinymce.util.URI
     */
    self.baseURI = new URI(self.baseURL);

    /**
     * Current suffix to add to each plugin/theme that gets loaded for example ".min".
     *
     * @property suffix
     * @type String
     */
    self.suffix = suffix;

    FocusController.setup(self);
  },

  /**
   * Overrides the default options for editor instances. The <code>overrideDefaults</code> method replaces the <code>defaultOptions</code>, including any set by a previous call to the <code>overrideDefaults</code> method.
   * <br /><br />
   * When using the Tiny Cloud, some of these defaults are required for the cloud-based editor to function.
   * <br /><br />
   * Therefore, when using <code>overrideDefaults</code> with the cloud-based editor, any newly integrated options must be combined with the options in <code>tinymce.defaultOptions</code>.
   *
   * @method overrideDefaults
   * @param {Object} defaultOptions Default options object.
   * @example
   * const customOptions = {
   *   toolbar_sticky: true
   * };
   *
   * tinymce.overrideDefaults({
   *   ...tinymce.defaultOptions,
   *   ...customOptions
   * });
   */
  overrideDefaults(defaultOptions) {
    const baseUrl = defaultOptions.base_url;
    if (baseUrl) {
      this._setBaseUrl(baseUrl);
    }

    const suffix = defaultOptions.suffix;
    if (suffix) {
      this.suffix = suffix;
    }

    this.defaultOptions = defaultOptions;

    const pluginBaseUrls = defaultOptions.plugin_base_urls;
    if (pluginBaseUrls !== undefined) {
      Obj.each(pluginBaseUrls, (pluginBaseUrl, pluginName) => {
        AddOnManager.PluginManager.urls[pluginName] = pluginBaseUrl;
      });
    }
  },

  /**
   * Initializes a set of editors. This method will create editors based on various settings.
   * <br /><br />
   * For information on basic usage of <code>init</code>, see: <a href="https://www.tiny.cloud/docs/tinymce/6/basic-setup/">Basic setup</a>.
   *
   * @method init
   * @param {Object} options Options object to be passed to each editor instance.
   * @return {Promise} Promise that gets resolved with an array of editors when all editor instances are initialized.
   * @example
   * // Initializes a editor using the longer method
   * tinymce.EditorManager.init({
   *    some_settings : 'some value'
   * });
   *
   * // Initializes a editor instance using the shorter version and with a promise
   * tinymce.init({
   *   some_settings : 'some value'
   * }).then((editors) => {
   *   ...
   * });
   */
  init(options: RawEditorOptions) {
    const self: EditorManager = this;
    let result: Editor[] | undefined;

    const invalidInlineTargets = Tools.makeMap(
      'area base basefont br col frame hr img input isindex link meta param embed source wbr track ' +
      'colgroup option table tbody tfoot thead tr th td script noscript style textarea video audio iframe object menu',
      ' '
    );

    const isInvalidInlineTarget = (options: RawEditorOptions, elm: HTMLElement) =>
      options.inline && elm.tagName.toLowerCase() in invalidInlineTargets;

    const createId = (elm: HTMLElement & { name?: string }): string => {
      let id = elm.id;

      if (!id) {
        id = Obj.get(elm, 'name').filter((name) => !DOM.get(name)).getOrThunk(DOM.uniqueId);
        elm.setAttribute('id', id);
      }
      return id;
    };

    const execCallback = (name: string) => {
      const callback = options[name];

      if (!callback) {
        return;
      }

      return callback.apply(self, []);
    };

    const findTargets = (options: RawEditorOptions): HTMLElement[] => {
      if (Env.browser.isIE() || Env.browser.isEdge()) {
        ErrorReporter.initError(
          'TinyMCE does not support the browser you are using. For a list of supported' +
          ' browsers please see: https://www.tiny.cloud/docs/tinymce/6/support/#supportedwebbrowsers'
        );
        return [];
      } else if (isQuirksMode) {
        ErrorReporter.initError(
          'Failed to initialize the editor as the document is not in standards mode. ' +
          'TinyMCE requires standards mode.'
        );
        return [];
      } else if (Type.isString(options.selector)) {
        return DOM.select(options.selector);
      } else if (Type.isNonNullable(options.target)) {
        return [ options.target ];
      } else {
        return [];
      }
    };

    let provideResults = (editors: Editor[]) => {
      result = editors;
    };

    const initEditors = () => {
      let initCount = 0;
      const editors: Editor[] = [];
      let targets: HTMLElement[];

      const createEditor = (id: string, options: RawEditorOptions, targetElm: HTMLElement) => {
        const editor: Editor = new Editor(id, options, self);
        editors.push(editor);

        editor.on('init', () => {
          if (++initCount === targets.length) {
            provideResults(editors);
          }
        });

        editor.targetElm = editor.targetElm || targetElm;
        editor.render();
      };

      DOM.unbind(window, 'ready', initEditors);
      execCallback('onpageload');

      targets = Arr.unique(findTargets(options));

      Tools.each(targets, (elm) => {
        purgeDestroyedEditor(self.get(elm.id));
      });

      targets = Tools.grep(targets, (elm) => {
        return !self.get(elm.id);
      });

      if (targets.length === 0) {
        provideResults([]);
      } else {
        each(targets, (elm) => {
          if (isInvalidInlineTarget(options, elm)) {
            ErrorReporter.initError('Could not initialize inline editor on invalid inline target element', elm);
          } else {
            createEditor(createId(elm), options, elm);
          }
        });
      }
    };

    DOM.bind(window, 'ready', initEditors);

    return new Promise((resolve) => {
      if (result) {
        resolve(result);
      } else {
        provideResults = (editors) => {
          resolve(editors);
        };
      }
    });
  },

  /**
   * Returns an editor instance for a given id.
   *
   * @method get
   * @param {String/Number} id The id or index of the editor instance to return.
   * @return {tinymce.Editor/Array} Editor instance or an array of editor instances.
   * @example
   * // Adds an onclick event to an editor by id
   * tinymce.get('mytextbox').on('click', (e) => {
   *   ed.windowManager.alert('Hello world!');
   * });
   *
   * // Adds an onclick event to an editor by index
   * tinymce.get(0).on('click', (e) => {
   *   ed.windowManager.alert('Hello world!');
   * });
   *
   * // Adds an onclick event to an editor by id (longer version)
   * tinymce.EditorManager.get('mytextbox').on('click', (e) => {
   *   ed.windowManager.alert('Hello world!');
   * });
   */
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  get(id?: number | string): any {
    if (arguments.length === 0) {
      return editors.slice(0);
    } else if (Type.isString(id)) {
      return Arr.find(editors, (editor) => {
        return editor.id === id;
      }).getOr(null);
    } else if (Type.isNumber(id)) {
      return editors[id] ? editors[id] : null;
    } else {
      return null;
    }
  },

  /**
   * Adds an editor instance to the editor collection. This will also set it as the active editor.
   *
   * @method add
   * @param {tinymce.Editor} editor Editor instance to add to the collection.
   * @return {tinymce.Editor} The same instance that got passed in.
   */
  add(editor) {
    const self: EditorManager = this;

    // Prevent existing editors from being added again this could happen
    // if a user calls createEditor then render or add multiple times.
    const existingEditor = self.get(editor.id);
    if (existingEditor === editor) {
      return editor;
    }

    if (existingEditor === null) {
      editors.push(editor);
    }

    toggleGlobalEvents(true);

    // Doesn't call setActive method since we don't want
    // to fire a bunch of activate/deactivate calls while initializing
    self.activeEditor = editor;

    self.dispatch('AddEditor', { editor });

    if (!beforeUnloadDelegate) {
      beforeUnloadDelegate = (e) => {
        const event = self.dispatch('BeforeUnload');
        if (event.returnValue) {
          // browsers are all a little bit special about this: https://developer.mozilla.org/en-US/docs/Web/API/BeforeUnloadEvent
          e.preventDefault();
          e.returnValue = event.returnValue;
          return event.returnValue;
        }
      };

      window.addEventListener('beforeunload', beforeUnloadDelegate);
    }

    return editor;
  },

  /**
   * Creates an editor instance and adds it to the EditorManager collection.
   *
   * @method createEditor
   * @param {String} id Instance id to use for editor.
   * @param {Object} options Editor instance options.
   * @return {tinymce.Editor} Editor instance that got created.
   */
  createEditor(id, options) {
    return this.add(new Editor(id, options, this));
  },

  /**
   * Removes a editor or editors form page.
   *
   * @example
   * // Remove all editors bound to divs
   * tinymce.remove('div');
   *
   * // Remove all editors bound to textareas
   * tinymce.remove('textarea');
   *
   * // Remove all editors
   * tinymce.remove();
   *
   * // Remove specific instance by id
   * tinymce.remove('#id');
   *
   * @method remove
   * @param {tinymce.Editor/String/Object} [selector] CSS selector or editor instance to remove.
   * @return {tinymce.Editor} The editor that got passed in will be return if it was found otherwise null.
   */
  remove(selector?: string | Editor): any {
    const self = this;
    let editor: Editor | null;

    // Remove all editors
    if (!selector) {
      for (let i = editors.length - 1; i >= 0; i--) {
        self.remove(editors[i]);
      }

      return;
    }

    // Remove editors by selector
    if (Type.isString(selector)) {
      each(DOM.select(selector), (elm) => {
        editor = self.get(elm.id);

        if (editor) {
          self.remove(editor);
        }
      });

      return;
    }

    // Remove specific editor
    editor = selector;

    // Not in the collection
    if (Type.isNull(self.get(editor.id))) {
      return null;
    }

    if (removeEditorFromList(editor)) {
      self.dispatch('RemoveEditor', { editor });
    }

    if (editors.length === 0) {
      window.removeEventListener('beforeunload', beforeUnloadDelegate);
    }

    editor.remove();

    toggleGlobalEvents(editors.length > 0);

    return editor;
  },

  /**
   * Executes a specific command on the currently active editor.
   *
   * @method execCommand
   * @param {String} cmd Command to perform for example Bold.
   * @param {Boolean} ui Optional boolean state if a UI should be presented for the command or not.
   * @param {Object/String/Number/Boolean} value Optional value parameter like for example an URL to a link.
   * @return {Boolean} true/false if the command was executed or not.
   */
  execCommand(cmd, ui, value) {
    const self = this;
    const editorId = Type.isObject(value) ? value.id ?? value.index : value;

    // Manager commands
    switch (cmd) {
      case 'mceAddEditor': {
        if (!self.get(editorId)) {
          const editorOptions = value.options;
          new Editor(editorId, editorOptions, self).render();
        }

        return true;
      }

      case 'mceRemoveEditor': {
        const editor = self.get(editorId);
        if (editor) {
          editor.remove();
        }

        return true;
      }

      case 'mceToggleEditor': {
        const editor = self.get(editorId);
        if (!editor) {
          self.execCommand('mceAddEditor', false, value);
          return true;
        }

        if (editor.isHidden()) {
          editor.show();
        } else {
          editor.hide();
        }

        return true;
      }
    }

    // Run command on active editor
    if (self.activeEditor) {
      return self.activeEditor.execCommand(cmd, ui, value);
    }

    return false;
  },

  /**
   * Calls the save method on all editor instances in the collection. This can be useful when a form is to be submitted.
   *
   * @method triggerSave
   * @example
   * // Saves all contents
   * tinyMCE.triggerSave();
   */
  triggerSave: () => {
    each(editors, (editor) => {
      editor.save();
    });
  },

  /**
   * Adds a language pack, this gets called by the loaded language files like en.js.
   *
   * @method addI18n
   * @param {String} code Optional language code.
   * @param {Object} items Name/value object with translations.
   */
  addI18n: (code, items) => {
    I18n.add(code, items);
  },

  /**
   * Translates the specified string using the language pack items.
   *
   * @method translate
   * @param {String/Array/Object} text String to translate
   * @return {String} Translated string.
   */
  translate: (text) => {
    return I18n.translate(text);
  },

  /**
   * Sets the active editor instance and fires the deactivate/activate events.
   *
   * @method setActive
   * @param {tinymce.Editor} editor Editor instance to set as the active instance.
   */
  setActive(editor) {
    const activeEditor = this.activeEditor;

    if (this.activeEditor !== editor) {
      if (activeEditor) {
        activeEditor.dispatch('deactivate', { relatedTarget: editor });
      }

      editor.dispatch('activate', { relatedTarget: activeEditor });
    }

    this.activeEditor = editor;
  },

  _setBaseUrl(baseUrl: string) {
    this.baseURL = new URI(this.documentBaseURL).toAbsolute(baseUrl.replace(/\/+$/, ''));
    this.baseURI = new URI(this.baseURL);
  }
};

EditorManager.setup();

export default EditorManager;
