/**
 * This file contains the documentation for the EditorManager
 */

/**
 * Dom query instance.
 *
 * @property $
 * @type tinymce.dom.DomQuery
 */

/**
 * Major version of TinyMCE build.
 *
 * @property majorVersion
 * @type String
 */

/**
 * Minor version of TinyMCE build.
 *
 * @property minorVersion
 * @type String
 */

/**
 * Release date of TinyMCE build.
 *
 * @property releaseDate
 * @type String
 */

/**
 * Collection of editor instances. Deprecated use tinymce.get() instead.
 *
 * @property editors
 * @type Object
 */

/**
 * Collection of language pack data.
 *
 * @property i18n
 * @type Object
 */

/**
 * Currently active editor instance.
 *
 * @property activeEditor
 * @type tinymce.Editor
 * @example
 * tinyMCE.activeEditor.selection.getContent();
 * tinymce.EditorManager.activeEditor.selection.getContent();
 */

/**
 * Base URL where the root directory if TinyMCE is located.
 *
 * @property baseURL
 * @type String
 */

/**
 * Document base URL where the current document is located.
 *
 * @property documentBaseURL
 * @type String
 */

/**
 * Absolute baseURI for the installation path of TinyMCE.
 *
 * @property baseURI
 * @type tinymce.util.URI
 */

/**
 * Current suffix to add to each plugin/theme that gets loaded for example ".min".
 *
 * @property suffix
 * @type String
 */

/**
 * Overrides the default settings for editor instances.
 *
 * @method overrideDefaults
 * @param {Object} defaultSettings Defaults settings object.
 */

/**
 * Initializes a set of editors. This method will create editors based on various settings.
 * <br /><br />
 * For information on basic usage of <code>init</code>, see: <a href="https://www.tiny.cloud/docs/general-configuration-guide/basic-setup/">Basic setup</a>.
 *
 * @method init
 * @param {Object} settings Settings object to be passed to each editor instance.
 * @return {Promise} Promise that gets resolved with an array of editors when all editor instances are initialized.
 * @example
 * // Initializes a editor using the longer method
 * tinymce.EditorManager.init({
 *    some_settings : 'some value'
 * });
 *
 * // Initializes a editor instance using the shorter version and with a promise
 * tinymce.init({
 *    some_settings : 'some value'
 * }).then(function(editors) {
 *    ...
 * });
 */

/**
 * Returns an editor instance for a given id.
 *
 * @method get
 * @param {String/Number} id The id or index of the editor instance to return.
 * @return {tinymce.Editor/Array} Editor instance or an array of editor instances.
 * @example
 * // Adds an onclick event to an editor by id
 * tinymce.get('mytextbox').on('click', function(e) {
 *    ed.windowManager.alert('Hello world!');
 * });
 *
 * // Adds an onclick event to an editor by index
 * tinymce.get(0).on('click', function(e) {
 *    ed.windowManager.alert('Hello world!');
 * });
 *
 * // Adds an onclick event to an editor by id (longer version)
 * tinymce.EditorManager.get('mytextbox').on('click', function(e) {
 *    ed.windowManager.alert('Hello world!');
 * });
 */

/**
 * Adds an editor instance to the editor collection. This will also set it as the active editor.
 *
 * @method add
 * @param {tinymce.Editor} editor Editor instance to add to the collection.
 * @return {tinymce.Editor} The same instance that got passed in.
 */

/**
 * Creates an editor instance and adds it to the EditorManager collection.
 *
 * @method createEditor
 * @param {String} id Instance id to use for editor.
 * @param {Object} settings Editor instance settings.
 * @return {tinymce.Editor} Editor instance that got created.
 */

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

/**
 * Executes a specific command on the currently active editor.
 *
 * @method execCommand
 * @param {String} cmd Command to perform for example Bold.
 * @param {Boolean} ui Optional boolean state if a UI should be presented for the command or not.
 * @param {String} value Optional value parameter like for example an URL to a link.
 * @return {Boolean} true/false if the command was executed or not.
 */

/**
 * Calls the save method on all editor instances in the collection. This can be useful when a form is to be submitted.
 *
 * @method triggerSave
 * @example
 * // Saves all contents
 * tinyMCE.triggerSave();
 */

/**
 * Adds a language pack, this gets called by the loaded language files like en.js.
 *
 * @method addI18n
 * @param {String} code Optional language code.
 * @param {Object} items Name/value object with translations.
 */

/**
 * Translates the specified string using the language pack items.
 *
 * @method translate
 * @param {String/Array/Object} text String to translate
 * @return {String} Translated string.
 */

/**
 * Sets the active editor instance and fires the deactivate/activate events.
 *
 * @method setActive
 * @param {tinymce.Editor} editor Editor instance to set as the active instance.
 */