/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj } from '@ephox/katamari';

import { DomQueryConstructor } from './dom/DomQuery';
import ScriptLoader from './dom/ScriptLoader';
import Editor from './Editor';
import I18n from './util/I18n';

/**
 * TinyMCE theme pseudo class. Allows for a custom theme to be used with TinyMCE when registered using the ThemeManager.
 *
 * @summary This is a pseudo class that describes how to create a custom theme for TinyMCE.
 * <br><br>
 * See AddOnManager for more information about the methods available on the ThemeManager instance.
 * <br><br>
 * <strong>Warning</strong>: Much of TinyMCE's functionality is provided by the default Silver theme.
 * Creating a custom theme may require the re-implementation of this functionality.
 * To change TinyMCE's appearance, Tiny recommends changing the Skin instead.
 *
 * @class tinymce.Theme
 * @example
 * tinymce.ThemeManager.add('MyTheme', function(editor) {
 *     // Setup up custom UI elements in the dom
 *     var div = document.createElement('div');
 *     var iframe = document.createElement('iframe');
 *     document.body.appendChild(div);
 *     document.body.appendChild(iframe);
 *
 *     // Themes should fire the SkinLoaded event once the UI has been created and all StyleSheets have been loaded.
 *     editor.on('init', function() {
 *         editor.fire('SkinLoaded');
 *     });
 *
 *     // Themes must return a renderUI function that returns the editorContainer. If the editor is not running in inline mode, an iframeContainer should also be returned.
 *     var renderUI = function() {
 *         return {
 *             editorContainer: div,
 *             iframeContainer: iframe
 *         };
 *     };
 *
 *     // Return the renderUI function
 *     return {
 *         renderUI: renderUI
 *     };
 * });
 */

/**
 * TinyMCE plugin psuedo class. Allows for custom plugins to be added to TinyMCE when registered using the PluginManager.
 *
 * @summary This is a pseudo class that describes how to create a custom plugin for TinyMCE.
 * <br><br>
 * A custom plugin registered using <code>PluginManager.add</code> should either not return any value or return plugin metadata as an object that contains the plugin's name and a URL.
 * The URL is intended to link to help documentation.
 * <br><br>
 * See AddOnManager for more information about the methods available on the PluginManager instance.
 *
 * @class tinymce.Plugin
 * @example
 * tinymce.PluginManager.add('MyPlugin', function(editor, url) {
 *     // Register a toolbar button that triggers an alert when clicked
 *     // To show this button in the editor, include it in the toolbar setting
 *     editor.ui.registry.addButton('myCustomToolbarButton', {
 *         text: 'My Custom Button',
 *         onAction: function() {
 *             alert('Button clicked!');
 *         }
 *     });
 *
 *     // Register a menu item that triggers an alert when clicked
 *     // To show this menu item in the editor, include it in the menu setting
 *     editor.ui.registry.addMenuItem('myCustomMenuItem', {
 *         text: 'My Custom Menu Item',
 *         onAction: function() {
 *             alert('Menu item clicked');
 *         }
 *     });
 *
 *     // Either return plugin metadata or do not return
 *     return {
 *         name: 'MyPlugin',
 *         url: 'https://mydocs.com/myplugin'
 *     };
 * });
 */

/**
 * This class handles the loading of add-ons and their language packs.
 * ThemeManager and PluginManager are instances of AddOnManager, and manage themes and plugins.
 *
 * @class tinymce.AddOnManager
 */

export interface UrlObject { prefix: string; resource: string; suffix: string }

type WaitState = 'added' | 'loaded';

// This is a work around as constructors will only work with classes,
// but our plugins are all functions.
type AddOnCallback<T> = (editor: Editor, url: string, $?: DomQueryConstructor) => void | T;
export type AddOnConstructor<T> = new (editor: Editor, url: string, $?: DomQueryConstructor) => T;

interface AddOnManager<T> {
  items: AddOnConstructor<T>[];
  urls: Record<string, string>;
  lookup: Record<string, { instance: AddOnConstructor<T>; dependencies?: string[] }>;
  _listeners: { name: string; state: WaitState; callback: () => void }[];
  get: (name: string) => AddOnConstructor<T>;
  dependencies: (name: string) => string[]; // TODO: deprecated in 5.7
  requireLangPack: (name: string, languages: string) => void;
  add: (id: string, addOn: AddOnCallback<T>, dependencies?: string[]) => AddOnConstructor<T>;
  remove: (name: string) => void;
  createUrl: (baseUrl: UrlObject, dep: string | UrlObject) => UrlObject;
  addComponents: (pluginName: string, scripts: string[]) => void;
  load: (name: string, addOnUrl: string | UrlObject, success?: () => void, scope?: any, failure?: () => void) => void;
  waitFor: (name: string, callback: () => void, state?: WaitState) => void;
}

const AddOnManager = <T>(): AddOnManager<T> => {
  const items: AddOnConstructor<T>[] = [];
  const urls: Record<string, string> = {};
  const lookup: Record<string, { instance: AddOnConstructor<T>; dependencies?: string[] }> = {};
  const _listeners: { name: string; state: WaitState; callback: () => void }[] = [];

  const runListeners = (name: string, state: WaitState) => {
    const matchedListeners = Arr.filter(_listeners, (listener) => listener.name === name && listener.state === state);
    Arr.each(matchedListeners, (listener) => listener.callback());
  };

  const get = (name: string) => {
    if (lookup[name]) {
      return lookup[name].instance;
    }

    return undefined;
  };

  const dependencies = (name: string) => {
    let result;

    if (lookup[name]) {
      result = lookup[name].dependencies;
    }

    return result || [];
  };

  const requireLangPack = (name: string, languages: string) => {
    if (AddOnManager.languageLoad !== false) {
      waitFor(name, () => {
        const language = I18n.getCode();
        const wrappedLanguages = ',' + (languages || '') + ',';

        if (!language || languages && wrappedLanguages.indexOf(',' + language + ',') === -1) {
          return;
        }

        ScriptLoader.ScriptLoader.add(urls[ name ] + '/langs/' + language + '.js');
      }, 'loaded');
    }
  };

  const add = (id: string, addOn: AddOnCallback<T>, dependencies?: string[]) => {
    const addOnConstructor = addOn as unknown as AddOnConstructor<T>;
    items.push(addOnConstructor);
    lookup[id] = { instance: addOnConstructor, dependencies };

    runListeners(id, 'added');

    return addOnConstructor;
  };

  const remove = (name: string) => {
    delete urls[name];
    delete lookup[name];
  };

  const createUrl = (baseUrl: string | UrlObject, dep: string | UrlObject): UrlObject => {
    if (typeof dep === 'object') {
      return dep;
    }

    return typeof baseUrl === 'string' ?
      { prefix: '', resource: dep, suffix: '' } :
      { prefix: baseUrl.prefix, resource: dep, suffix: baseUrl.suffix };
  };

  const addComponents = (pluginName: string, scripts: string[]) => {
    const pluginUrl = urls[pluginName];

    Arr.each(scripts, (script) => {
      ScriptLoader.ScriptLoader.add(pluginUrl + '/' + script);
    });
  };

  const loadDependencies = (name: string, addOnUrl: string | UrlObject, success: () => void, scope: any) => {
    const deps = dependencies(name);

    Arr.each(deps, (dep) => {
      const newUrl = createUrl(addOnUrl, dep);

      load(newUrl.resource, newUrl, undefined, undefined);
    });

    if (success) {
      if (scope) {
        success.call(scope);
      } else {
        success.call(ScriptLoader);
      }
    }
  };

  const load = (name: string, addOnUrl: string | UrlObject, success?: () => void, scope?: any, failure?: () => void) => {
    if (urls[name]) {
      return;
    }

    let urlString = typeof addOnUrl === 'string' ? addOnUrl : addOnUrl.prefix + addOnUrl.resource + addOnUrl.suffix;

    if (urlString.indexOf('/') !== 0 && urlString.indexOf('://') === -1) {
      urlString = AddOnManager.baseURL + '/' + urlString;
    }

    urls[name] = urlString.substring(0, urlString.lastIndexOf('/'));

    const done = () => {
      runListeners(name, 'loaded');
      loadDependencies(name, addOnUrl, success, scope);
    };

    if (lookup[name]) {
      done();
    } else {
      ScriptLoader.ScriptLoader.add(urlString, done, scope, failure);
    }
  };

  const waitFor = (name: string, callback: () => void, state: 'added' | 'loaded' = 'added') => {
    if (Obj.has(lookup, name) && state === 'added') {
      callback();
    } else if (Obj.has(urls, name) && state === 'loaded') {
      callback();
    } else {
      _listeners.push({ name, state, callback });
    }
  };

  return {
    items,
    urls,
    lookup,
    _listeners,
    /**
     * Returns the specified add on by the short name.
     *
     * @method get
     * @param {String} name Add-on to look for.
     * @return {tinymce.Theme/tinymce.Plugin} Theme or plugin add-on instance or undefined.
     */
    get,

    /**
     * <em>Deprecated in TinyMCE 5.7 and has been marked for removal in TinyMCE 6.0.</em>
     *
     * @method dependencies
     * @param {String} pluginName Name of the plugin to lookup dependencies for.
     * @return {Array} An array of dependencies for the specified plugin.
     * @deprecated
     */
    dependencies,

    /**
     * Loads a language pack for the specified add-on.
     *
     * @method requireLangPack
     * @param {String} name Short name of the add-on.
     * @param {String} languages Optional comma or space separated list of languages to check if it matches the name.
     */
    requireLangPack,

    /**
     * Adds a instance of the add-on by it's short name.
     *
     * @method add
     * @param {String} id Short name/id for the add-on.
     * @param {tinymce.Theme/tinymce.Plugin} addOn Theme or plugin to add.
     * @return {tinymce.Theme/tinymce.Plugin} The same theme or plugin instance that got passed in.
     * @example
     * // Create a simple plugin
     * tinymce.create('tinymce.plugins.TestPlugin', {
     *   TestPlugin: function(ed, url) {
     *   ed.on('click', function(e) {
     *      ed.windowManager.alert('Hello World!');
     *   });
     *   }
     * });
     *
     * // Register plugin using the add method
     * tinymce.PluginManager.add('test', tinymce.plugins.TestPlugin);
     *
     * // Initialize TinyMCE
     * tinymce.init({
     *  ...
     *  plugins: '-test' // Init the plugin but don't try to load it
     * });
     */
    add,

    remove,

    createUrl,

    /**
     * Add a set of components that will make up the add-on. Using the url of the add-on name as the base url.
     * This should be used in development mode.  A new compressor/javascript munger process will ensure that the
     * components are put together into the plugin.js file and compressed correctly.
     * <br>
     * <em>Deprecated in TinyMCE 5.7 and has been marked for removal in TinyMCE 6.0.</em>
     *
     * @method addComponents
     * @param {String} pluginName name of the plugin to load scripts from (will be used to get the base url for the plugins).
     * @param {Array} scripts Array containing the names of the scripts to load.
     * @deprecated in 5.7
     */
    addComponents,

    /**
     * Loads an add-on from a specific url.
     *
     * @method load
     * @param {String} name Short name of the add-on that gets loaded.
     * @param {String} addOnUrl URL to the add-on that will get loaded.
     * @param {function} success Optional success callback to execute when an add-on is loaded.
     * @param {Object} scope Optional scope to execute the callback in.
     * @param {function} failure Optional failure callback to execute when an add-on failed to load.
     * @example
     * // Loads a plugin from an external URL
     * tinymce.PluginManager.load('myplugin', '/some/dir/someplugin/plugin.js');
     *
     * // Initialize TinyMCE
     * tinymce.init({
     *  ...
     *  plugins: '-myplugin' // Don't try to load it again
     * });
     */
    load,

    waitFor

  };
};

AddOnManager.languageLoad = true;
AddOnManager.baseURL = '';
AddOnManager.PluginManager = AddOnManager<any>();
AddOnManager.ThemeManager = AddOnManager<any>();

export default AddOnManager;
