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
 * This class handles the loading of themes/plugins or other add-ons and their language packs.
 *
 * @class tinymce.AddOnManager
 */

/**
 * TinyMCE theme class.
 *
 * @class tinymce.Theme
 */

/**
 * This method is responsible for rendering/generating the overall user interface with toolbars, buttons, iframe containers etc.
 *
 * @method renderUI
 * @param {Object} obj Object parameter containing the targetNode DOM node that will be replaced visually with an editor instance.
 * @return {Object} an object with items like iframeContainer, editorContainer, sizeContainer.
 */

/**
 * Plugin base class, this is a pseudo class that describes how a plugin is to be created for TinyMCE. The methods below are all optional.
 *
 * @class tinymce.Plugin
 * @example
 * tinymce.PluginManager.add('example', function(editor, url) {
 *     // Add a button that opens a window
 *     editor.addButton('example', {
 *         text: 'My button',
 *         icon: false,
 *         onclick: function() {
 *             // Open window
 *             editor.windowManager.open({
 *                 title: 'Example plugin',
 *                 body: [
 *                     {type: 'textbox', name: 'title', label: 'Title'}
 *                 ],
 *                 onsubmit: function(e) {
 *                     // Insert content when the window form is submitted
 *                     editor.insertContent('Title: ' + e.data.title);
 *                 }
 *             });
 *         }
 *     });
 *
 *     // Adds a menu item to the tools menu
 *     editor.addMenuItem('example', {
 *         text: 'Example plugin',
 *         context: 'tools',
 *         onclick: function() {
 *             // Open window with a specific url
 *             editor.windowManager.open({
 *                 title: 'TinyMCE site',
 *                 url: 'http://www.tinymce.com',
 *                 width: 800,
 *                 height: 600,
 *                 buttons: [{
 *                     text: 'Close',
 *                     onclick: 'close'
 *                 }]
 *             });
 *         }
 *     });
 * });
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
  get (name: string): AddOnConstructor<T>;
  dependencies (name: string): string[];
  requireLangPack (name: string, languages: string): void;
  add (id: string, addOn: AddOnCallback<T>, dependencies?: string[]): AddOnConstructor<T>;
  remove (name: string): void;
  createUrl (baseUrl: UrlObject, dep: string | UrlObject): UrlObject;
  addComponents (pluginName: string, scripts: string[]): void;
  load (name: string, addOnUrl: string | UrlObject, success?: () => void, scope?: {}, failure?: () => void): void;
  waitFor (name: string, callback: () => void, state?: WaitState): void;
}

function AddOnManager<T>(): AddOnManager<T> {
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
    const pluginUrl = this.urls[pluginName];

    Arr.each(scripts, function (script) {
      ScriptLoader.ScriptLoader.add(pluginUrl + '/' + script);
    });
  };

  const loadDependencies = function (name: string, addOnUrl: string | UrlObject, success: () => void, scope: any) {
    const deps = dependencies(name);

    Arr.each(deps, function (dep) {
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

  const load = (name: string, addOnUrl: string | UrlObject, success?: () => void, scope?: {}, failure?: () => void) => {
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
     *
     * @method addComponents
     * @param {String} pluginName name of the plugin to load scripts from (will be used to get the base url for the plugins).
     * @param {Array} scripts Array containing the names of the scripts to load.
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
}

namespace AddOnManager {
  export let language;
  export let languageLoad;
  export let baseURL;
  export const PluginManager: AddOnManager<any> = AddOnManager();
  export const ThemeManager: AddOnManager<any> = AddOnManager();
}

export default AddOnManager;
