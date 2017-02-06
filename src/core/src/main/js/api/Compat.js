/**
 * Compat.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * TinyMCE core class.
 *
 * @static
 * @class tinymce
 * @borrow-members tinymce.EditorManager
 * @borrow-members tinymce.util.Tools
 */
define(
  'tinymce.core.api.Compat',
  [
    "tinymce.core.dom.DOMUtils",
    "tinymce.core.dom.EventUtils",
    "tinymce.core.dom.ScriptLoader",
    "tinymce.core.AddOnManager",
    "tinymce.core.util.Tools",
    "tinymce.core.Env"
  ],
  function (DOMUtils, EventUtils, ScriptLoader, AddOnManager, Tools, Env) {
    var register = function (tinymce) {
      /**
       * @property {tinymce.dom.DOMUtils} DOM Global DOM instance.
       * @property {tinymce.dom.ScriptLoader} ScriptLoader Global ScriptLoader instance.
       * @property {tinymce.AddOnManager} PluginManager Global PluginManager instance.
       * @property {tinymce.AddOnManager} ThemeManager Global ThemeManager instance.
       */
      tinymce.DOM = DOMUtils.DOM;
      tinymce.ScriptLoader = ScriptLoader.ScriptLoader;
      tinymce.PluginManager = AddOnManager.PluginManager;
      tinymce.ThemeManager = AddOnManager.ThemeManager;

      tinymce.dom = tinymce.dom || {};
      tinymce.dom.Event = EventUtils.Event;

      Tools.each(
        'trim isArray is toArray makeMap each map grep inArray extend create walk createNS resolve explode _addCacheSuffix'.split(' '),
        function (key) {
          tinymce[key] = Tools[key];
        }
      );

      Tools.each('isOpera isWebKit isIE isGecko isMac'.split(' '), function (name) {
        tinymce[name] = Env[name.substr(2).toLowerCase()];
      });
    };

    return {
      register: register
    };
  }
);

// Describe the different namespaces

/**
 * Root level namespace this contains classes directly related to the TinyMCE editor.
 *
 * @namespace tinymce
 */

/**
 * Contains classes for handling the browsers DOM.
 *
 * @namespace tinymce.dom
 */

/**
 * Contains html parser and serializer logic.
 *
 * @namespace tinymce.html
 */

/**
 * Contains the different UI types such as buttons, listboxes etc.
 *
 * @namespace tinymce.ui
 */

/**
 * Contains various utility classes such as json parser, cookies etc.
 *
 * @namespace tinymce.util
 */

/**
 * Contains modules to handle data binding.
 *
 * @namespace tinymce.data
 */
