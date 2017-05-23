/**
 * Editor.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint scripturl:true */

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
define(
  'tinymce.core.Editor',
  [
    'tinymce.core.AddOnManager',
    'tinymce.core.dom.DomQuery',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.EditorCommands',
    'tinymce.core.EditorObservable',
    'tinymce.core.Env',
    'tinymce.core.html.Serializer',
    'tinymce.core.init.Render',
    'tinymce.core.Mode',
    'tinymce.core.Shortcuts',
    'tinymce.core.ui.Sidebar',
    'tinymce.core.util.Tools',
    'tinymce.core.util.URI',
    'tinymce.core.util.Uuid'
  ],
  function (
    AddOnManager, DomQuery, DOMUtils, EditorCommands, EditorObservable, Env, Serializer, Render, Mode,
    Shortcuts, Sidebar, Tools, URI, Uuid
  ) {
    // Shorten these names
    var DOM = DOMUtils.DOM;
    var extend = Tools.extend, each = Tools.each;
    var trim = Tools.trim, resolve = Tools.resolve;
    var isGecko = Env.gecko, ie = Env.ie;

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
    function Editor(id, settings, editorManager) {
      var self = this, documentBaseUrl, baseUri, defaultSettings;

      documentBaseUrl = self.documentBaseUrl = editorManager.documentBaseURL;
      baseUri = editorManager.baseURI;
      defaultSettings = editorManager.defaultSettings;

      /**
       * Name/value collection with editor settings.
       *
       * @property settings
       * @type Object
       * @example
       * // Get the value of the theme setting
       * tinymce.activeEditor.windowManager.alert("You are using the " + tinymce.activeEditor.settings.theme + " theme");
       */
      settings = extend({
        id: id,
        theme: 'modern',
        delta_width: 0,
        delta_height: 0,
        popup_css: '',
        plugins: '',
        document_base_url: documentBaseUrl,
        add_form_submit_trigger: true,
        submit_patch: true,
        add_unload_trigger: true,
        convert_urls: true,
        relative_urls: true,
        remove_script_host: true,
        object_resizing: true,
        doctype: '<!DOCTYPE html>',
        visual: true,
        font_size_style_values: 'xx-small,x-small,small,medium,large,x-large,xx-large',

        // See: http://www.w3.org/TR/CSS2/fonts.html#propdef-font-size
        font_size_legacy_values: 'xx-small,small,medium,large,x-large,xx-large,300%',
        forced_root_block: 'p',
        hidden_input: true,
        padd_empty_editor: true,
        render_ui: true,
        indentation: '30px',
        inline_styles: true,
        convert_fonts_to_spans: true,
        indent: 'simple',
        indent_before: 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,th,ul,ol,li,dl,dt,dd,area,table,thead,' +
        'tfoot,tbody,tr,section,article,hgroup,aside,figure,figcaption,option,optgroup,datalist',
        indent_after: 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,th,ul,ol,li,dl,dt,dd,area,table,thead,' +
        'tfoot,tbody,tr,section,article,hgroup,aside,figure,figcaption,option,optgroup,datalist',
        validate: true,
        entity_encoding: 'named',
        url_converter: self.convertURL,
        url_converter_scope: self,
        ie7_compat: true
      }, defaultSettings, settings);

      // Merge external_plugins
      if (defaultSettings && defaultSettings.external_plugins && settings.external_plugins) {
        settings.external_plugins = extend({}, defaultSettings.external_plugins, settings.external_plugins);
      }

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
      self.id = settings.id = id;

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
      self.documentBaseURI = new URI(settings.document_base_url || documentBaseUrl, {
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

      // Creates all events like onClick, onSetContent etc see Editor.Events.js for the actual logic
      self.shortcuts = new Shortcuts(self);
      self.loadedCSS = {};
      self.editorCommands = new EditorCommands(self);
      self.suffix = editorManager.suffix;
      self.editorManager = editorManager;
      self.inline = settings.inline;
      self.settings.content_editable = self.inline;

      if (settings.cache_suffix) {
        Env.cacheSuffix = settings.cache_suffix.replace(/^[\?\&]+/, '');
      }

      if (settings.override_viewport === false) {
        Env.overrideViewPort = false;
      }

      // Call setup
      editorManager.fire('SetupEditor', self);
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
    }

    Editor.prototype = {
      /**
       * Renders the editor/adds it to the page.
       *
       * @method render
       */
      render: function () {
        Render.render(this);
      },

      /**
       * Focuses/activates the editor. This will set this editor as the activeEditor in the tinymce collection
       * it will also place DOM focus inside the editor.
       *
       * @method focus
       * @param {Boolean} skipFocus Skip DOM focus. Just set is as the active editor.
       */
      focus: function (skipFocus) {
        var self = this, selection = self.selection, contentEditable = self.settings.content_editable, rng;
        var controlElm, doc = self.getDoc(), body = self.getBody(), contentEditableHost;

        function getContentEditableHost(node) {
          return self.dom.getParent(node, function (node) {
            return self.dom.getContentEditable(node) === "true";
          });
        }

        if (self.removed) {
          return;
        }

        if (!skipFocus) {
          // Get selected control element
          rng = selection.getRng();
          if (rng.item) {
            controlElm = rng.item(0);
          }

          self.quirks.refreshContentEditable();

          // Move focus to contentEditable=true child if needed
          contentEditableHost = getContentEditableHost(selection.getNode());
          if (self.$.contains(body, contentEditableHost)) {
            contentEditableHost.focus();
            selection.normalize();
            self.editorManager.setActive(self);
            return;
          }

          // Focus the window iframe
          if (!contentEditable) {
            // WebKit needs this call to fire focusin event properly see #5948
            // But Opera pre Blink engine will produce an empty selection so skip Opera
            if (!Env.opera) {
              self.getBody().focus();
            }

            self.getWin().focus();
          }

          // Focus the body as well since it's contentEditable
          if (isGecko || contentEditable) {
            // Check for setActive since it doesn't scroll to the element
            if (body.setActive) {
              // IE 11 sometimes throws "Invalid function" then fallback to focus
              try {
                body.setActive();
              } catch (ex) {
                body.focus();
              }
            } else {
              body.focus();
            }

            if (contentEditable) {
              selection.normalize();
            }
          }

          // Restore selected control element
          // This is needed when for example an image is selected within a
          // layer a call to focus will then remove the control selection
          if (controlElm && controlElm.ownerDocument == doc) {
            rng = doc.body.createControlRange();
            rng.addElement(controlElm);
            rng.select();
          }
        }

        self.editorManager.setActive(self);
      },

      /**
       * Executes a legacy callback. This method is useful to call old 2.x option callbacks.
       * There new event model is a better way to add callback so this method might be removed in the future.
       *
       * @method execCallback
       * @param {String} name Name of the callback to execute.
       * @return {Object} Return value passed from callback function.
       */
      execCallback: function (name) {
        var self = this, callback = self.settings[name], scope;

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
          self.callbackLookup[name] = { func: callback, scope: scope };
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
      translate: function (text) {
        var lang = this.settings.language || 'en', i18n = this.editorManager.i18n;

        if (!text) {
          return '';
        }

        text = i18n.data[lang + '.' + text] || text.replace(/\{\#([^\}]+)\}/g, function (a, b) {
          return i18n.data[lang + '.' + b] || '{#' + b + '}';
        });

        return this.editorManager.translate(text);
      },

      /**
       * Returns a language pack item by name/key.
       *
       * @method getLang
       * @param {String} name Name/key to get from the language pack.
       * @param {String} defaultVal Optional default value to retrieve.
       */
      getLang: function (name, defaultVal) {
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
      getParam: function (name, defaultVal, type) {
        var value = name in this.settings ? this.settings[name] : defaultVal, output;

        if (type === 'hash') {
          output = {};

          if (typeof value === 'string') {
            each(value.indexOf('=') > 0 ? value.split(/[;,](?![^=;,]*(?:[;,]|$))/) : value.split(','), function (value) {
              value = value.split('=');

              if (value.length > 1) {
                output[trim(value[0])] = trim(value[1]);
              } else {
                output[trim(value[0])] = trim(value);
              }
            });
          } else {
            output = value;
          }

          return output;
        }

        return value;
      },

      /**
       * Dispatches out a onNodeChange event to all observers. This method should be called when you
       * need to update the UI states or element path etc.
       *
       * @method nodeChanged
       * @param {Object} args Optional args to pass to NodeChange event handlers.
       */
      nodeChanged: function (args) {
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
      addButton: function (name, settings) {
        var self = this;

        if (settings.cmd) {
          settings.onclick = function () {
            self.execCommand(settings.cmd);
          };
        }

        if (!settings.text && !settings.icon) {
          settings.icon = name;
        }

        self.buttons = self.buttons || {};
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
      addSidebar: function (name, settings) {
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
      addMenuItem: function (name, settings) {
        var self = this;

        if (settings.cmd) {
          settings.onclick = function () {
            self.execCommand(settings.cmd);
          };
        }

        self.menuItems = self.menuItems || {};
        self.menuItems[name] = settings;
      },

      /**
       * Adds a contextual toolbar to be rendered when the selector matches.
       *
       * @method addContextToolbar
       * @param {function/string} predicate Predicate that needs to return true if provided strings get converted into CSS predicates.
       * @param {String/Array} items String or array with items to add to the context toolbar.
       */
      addContextToolbar: function (predicate, items) {
        var self = this, selector;

        self.contextToolbars = self.contextToolbars || [];

        // Convert selector to predicate
        if (typeof predicate == "string") {
          selector = predicate;
          predicate = function (elm) {
            return self.dom.is(elm, selector);
          };
        }

        self.contextToolbars.push({
          id: Uuid.uuid('mcet'),
          predicate: predicate,
          items: items
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
      addCommand: function (name, callback, scope) {
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
      addQueryStateHandler: function (name, callback, scope) {
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
      addQueryValueHandler: function (name, callback, scope) {
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
      addShortcut: function (pattern, desc, cmdFunc, scope) {
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
      execCommand: function (cmd, ui, value, args) {
        return this.editorCommands.execCommand(cmd, ui, value, args);
      },

      /**
       * Returns a command specific state, for example if bold is enabled or not.
       *
       * @method queryCommandState
       * @param {string} cmd Command to query state from.
       * @return {Boolean} Command specific state, for example if bold is enabled or not.
       */
      queryCommandState: function (cmd) {
        return this.editorCommands.queryCommandState(cmd);
      },

      /**
       * Returns a command specific value, for example the current font size.
       *
       * @method queryCommandValue
       * @param {string} cmd Command to query value from.
       * @return {Object} Command specific value, for example the current font size.
       */
      queryCommandValue: function (cmd) {
        return this.editorCommands.queryCommandValue(cmd);
      },

      /**
       * Returns true/false if the command is supported or not.
       *
       * @method queryCommandSupported
       * @param {String} cmd Command that we check support for.
       * @return {Boolean} true/false if the command is supported or not.
       */
      queryCommandSupported: function (cmd) {
        return this.editorCommands.queryCommandSupported(cmd);
      },

      /**
       * Shows the editor and hides any textarea/div that the editor is supposed to replace.
       *
       * @method show
       */
      show: function () {
        var self = this;

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
      hide: function () {
        var self = this, doc = self.getDoc();

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
            if (self == self.editorManager.focusedEditor) {
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
      isHidden: function () {
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
      setProgressState: function (state, time) {
        this.fire('ProgressState', { state: state, time: time });
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
      load: function (args) {
        var self = this, elm = self.getElement(), html;

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
      save: function (args) {
        var self = this, elm = self.getElement(), html, form;

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
        if (args.format == 'raw') {
          self.fire('RawSaveContent', args);
        }

        html = args.content;

        if (!/TEXTAREA|INPUT/i.test(elm.nodeName)) {
          // Update DIV element when not in inline mode
          if (!self.inline) {
            elm.innerHTML = html;
          }

          // Update hidden form element
          if ((form = DOM.getParent(self.id, 'form'))) {
            each(form.elements, function (elm) {
              if (elm.name == self.id) {
                elm.value = html;
                return false;
              }
            });
          }
        } else {
          elm.value = html;
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
      setContent: function (content, args) {
        var self = this, body = self.getBody(), forcedRootBlockName, padd;

        // Setup args object
        args = args || {};
        args.format = args.format || 'html';
        args.set = true;
        args.content = content;

        // Do preprocessing
        if (!args.no_events) {
          self.fire('BeforeSetContent', args);
        }

        content = args.content;

        // Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
        // It will also be impossible to place the caret in the editor unless there is a BR element present
        if (content.length === 0 || /^\s+$/.test(content)) {
          padd = ie && ie < 11 ? '' : '<br data-mce-bogus="1">';

          // Todo: There is a lot more root elements that need special padding
          // so separate this and add all of them at some point.
          if (body.nodeName == 'TABLE') {
            content = '<tr><td>' + padd + '</td></tr>';
          } else if (/^(UL|OL)$/.test(body.nodeName)) {
            content = '<li>' + padd + '</li>';
          }

          forcedRootBlockName = self.settings.forced_root_block;

          // Check if forcedRootBlock is configured and that the block is a valid child of the body
          if (forcedRootBlockName && self.schema.isValidChild(body.nodeName.toLowerCase(), forcedRootBlockName.toLowerCase())) {
            // Padd with bogus BR elements on modern browsers and IE 7 and 8 since they don't render empty P tags properly
            content = padd;
            content = self.dom.createHTML(forcedRootBlockName, self.settings.forced_root_block_attrs, content);
          } else if (!ie && !content) {
            // We need to add a BR when forced_root_block is disabled on non IE browsers to place the caret
            content = '<br data-mce-bogus="1">';
          }

          self.dom.setHTML(body, content);

          self.fire('SetContent', args);
        } else {
          // Parse and serialize the html
          if (args.format !== 'raw') {
            content = new Serializer({
              validate: self.validate
            }, self.schema).serialize(
              self.parser.parse(content, { isRootContent: true })
              );
          }

          // Set the new cleaned contents to the editor
          args.content = trim(content);
          self.dom.setHTML(body, args.content);

          // Do post processing
          if (!args.no_events) {
            self.fire('SetContent', args);
          }

          // Don't normalize selection if the focused element isn't the body in
          // content editable mode since it will steal focus otherwise
          /*if (!self.settings.content_editable || document.activeElement === self.getBody()) {
            self.selection.normalize();
          }*/
        }

        return args.content;
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
      getContent: function (args) {
        var self = this, content, body = self.getBody();

        if (self.removed) {
          return '';
        }

        // Setup args object
        args = args || {};
        args.format = args.format || 'html';
        args.get = true;
        args.getInner = true;

        // Do preprocessing
        if (!args.no_events) {
          self.fire('BeforeGetContent', args);
        }

        // Get raw contents or by default the cleaned contents
        if (args.format == 'raw') {
          content = Tools.trim(self.serializer.getTrimmedContent());
        } else if (args.format == 'text') {
          content = body.innerText || body.textContent;
        } else {
          content = self.serializer.serialize(body, args);
        }

        // Trim whitespace in beginning/end of HTML
        if (args.format != 'text') {
          args.content = trim(content);
        } else {
          args.content = content;
        }

        // Do post processing
        if (!args.no_events) {
          self.fire('GetContent', args);
        }

        return args.content;
      },

      /**
       * Inserts content at caret position.
       *
       * @method insertContent
       * @param {String} content Content to insert.
       * @param {Object} args Optional args to pass to insert call.
       */
      insertContent: function (content, args) {
        if (args) {
          content = extend({ content: content }, args);
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
      isDirty: function () {
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
      setDirty: function (state) {
        var oldState = !this.isNotDirty;

        this.isNotDirty = !state;

        if (state && state != oldState) {
          this.fire('dirty');
        }
      },

      /**
       * Sets the editor mode. Mode can be for example "design", "code" or "readonly".
       *
       * @method setMode
       * @param {String} mode Mode to set the editor in.
       */
      setMode: function (mode) {
        Mode.setMode(this, mode);
      },

      /**
       * Returns the editors container element. The container element wrappes in
       * all the elements added to the page for the editor. Such as UI, iframe etc.
       *
       * @method getContainer
       * @return {Element} HTML DOM element for the editor container.
       */
      getContainer: function () {
        var self = this;

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
      getContentAreaContainer: function () {
        return this.contentAreaContainer;
      },

      /**
       * Returns the target element/textarea that got replaced with a TinyMCE editor instance.
       *
       * @method getElement
       * @return {Element} HTML DOM element for the replaced element.
       */
      getElement: function () {
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
      getWin: function () {
        var self = this, elm;

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
      getDoc: function () {
        var self = this, win;

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
      getBody: function () {
        var doc = this.getDoc();
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
      convertURL: function (url, name, elm) {
        var self = this, settings = self.settings;

        // Use callback instead
        if (settings.urlconverter_callback) {
          return self.execCallback('urlconverter_callback', url, elm, true, name);
        }

        // Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
        if (!settings.convert_urls || (elm && elm.nodeName == 'LINK') || url.indexOf('file:') === 0 || url.length === 0) {
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
      addVisual: function (elm) {
        var self = this, settings = self.settings, dom = self.dom, cls;

        elm = elm || self.getBody();

        if (self.hasVisual === undefined) {
          self.hasVisual = settings.visual;
        }

        each(dom.select('table,a', elm), function (elm) {
          var value;

          switch (elm.nodeName) {
            case 'TABLE':
              cls = settings.visual_table_class || 'mce-item-table';
              value = dom.getAttrib(elm, 'border');

              if ((!value || value == '0') && self.hasVisual) {
                dom.addClass(elm, cls);
              } else {
                dom.removeClass(elm, cls);
              }

              return;

            case 'A':
              if (!dom.getAttrib(elm, 'href', false)) {
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
      remove: function () {
        var self = this;

        if (!self.removed) {
          self.save();
          self.removed = 1;
          self.unbindAllNativeEvents();

          // Remove any hidden input
          if (self.hasHiddenInput) {
            DOM.remove(self.getElement().nextSibling);
          }

          if (!self.inline) {
            // IE 9 has a bug where the selection stops working if you place the
            // caret inside the editor then remove the iframe
            if (ie && ie < 10) {
              self.getDoc().execCommand('SelectAll', false, null);
            }

            DOM.setStyle(self.id, 'display', self.orgDisplay);
            self.getBody().onload = null; // Prevent #6816
          }

          self.fire('remove');

          self.editorManager.remove(self);
          DOM.remove(self.getContainer());
          self._selectionOverrides.destroy();
          self.editorUpload.destroy();
          self.destroy();
        }
      },

      /**
       * Destroys the editor instance by removing all events, element references or other resources
       * that could leak memory. This method will be called automatically when the page is unloaded
       * but you can also call it directly if you know what you are doing.
       *
       * @method destroy
       * @param {Boolean} automatic Optional state if the destroy is an automatic destroy or user called one.
       */
      destroy: function (automatic) {
        var self = this, form;

        // One time is enough
        if (self.destroyed) {
          return;
        }

        // If user manually calls destroy and not remove
        // Users seems to have logic that calls destroy instead of remove
        if (!automatic && !self.removed) {
          self.remove();
          return;
        }

        if (!automatic) {
          self.editorManager.off('beforeunload', self._beforeUnload);

          // Manual destroy
          if (self.theme && self.theme.destroy) {
            self.theme.destroy();
          }

          // Destroy controls, selection and dom
          self.selection.destroy();
          self.dom.destroy();
        }

        form = self.formElement;
        if (form) {
          if (form._mceOldSubmit) {
            form.submit = form._mceOldSubmit;
            form._mceOldSubmit = null;
          }

          DOM.unbind(form, 'submit reset', self.formEventDelegate);
        }

        self.contentAreaContainer = self.formElement = self.container = self.editorContainer = null;
        self.bodyElement = self.contentDocument = self.contentWindow = null;
        self.iframeElement = self.targetElm = null;

        if (self.selection) {
          self.selection = self.selection.win = self.selection.dom = self.selection.dom.doc = null;
        }

        self.destroyed = 1;
      },

      /**
       * Uploads all data uri/blob uri images in the editor contents to server.
       *
       * @method uploadImages
       * @param {function} callback Optional callback with images and status for each image.
       * @return {tinymce.util.Promise} Promise instance.
       */
      uploadImages: function (callback) {
        return this.editorUpload.uploadImages(callback);
      },

      // Internal functions

      _scanForImages: function () {
        return this.editorUpload.scanForImages();
      }
    };

    extend(Editor.prototype, EditorObservable);

    return Editor;
  }
);
