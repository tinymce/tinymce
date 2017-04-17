/**
 * This file contains the documentation for the Editor API.
 */

/**
 * Schema instance, enables you to validate elements and its children.
 *
 * @property schema
 * @type tinymce.html.Schema
 */

/**
 * DOM instance for the editor.
 *
 * @property dom
 * @type tinymce.dom.DOMUtils
 * @example
 * // Adds a class to all paragraphs within the editor
 * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'someclass');
 */

/**
 * HTML parser will be used when contents is inserted into the editor.
 *
 * @property parser
 * @type tinymce.html.DomParser
 */

/**
 * DOM serializer for the editor. Will be used when contents is extracted from the editor.
 *
 * @property serializer
 * @type tinymce.dom.Serializer
 * @example
 * // Serializes the first paragraph in the editor into a string
 * tinymce.activeEditor.serializer.serialize(tinymce.activeEditor.dom.select('p')[0]);
 */

/**
 * Selection instance for the editor.
 *
 * @property selection
 * @type tinymce.dom.Selection
 * @example
 * // Sets some contents to the current selection in the editor
 * tinymce.activeEditor.selection.setContent('Some contents');
 *
 * // Gets the current selection
 * alert(tinymce.activeEditor.selection.getContent());
 *
 * // Selects the first paragraph found
 * tinymce.activeEditor.selection.select(tinymce.activeEditor.dom.select('p')[0]);
 */

/**
 * Formatter instance.
 *
 * @property formatter
 * @type tinymce.Formatter
 */

/**
 * Undo manager instance, responsible for handling undo levels.
 *
 * @property undoManager
 * @type tinymce.UndoManager
 * @example
 * // Undoes the last modification to the editor
 * tinymce.activeEditor.undoManager.undo();
 */

/**
 * Is set to true after the editor instance has been initialized
 *
 * @property initialized
 * @type Boolean
 * @example
 * function isEditorInitialized(editor) {
 *     return editor && editor.initialized;
 * }
 */

/**
 * Window manager reference, use this to open new windows and dialogs.
 *
 * @property windowManager
 * @type tinymce.WindowManager
 * @example
 * // Shows an alert message
 * tinymce.activeEditor.windowManager.alert('Hello world!');
 *
 * // Opens a new dialog with the file.htm file and the size 320x240
 * // It also adds a custom parameter this can be retrieved by using tinyMCEPopup.getWindowArg inside the dialog.
 * tinymce.activeEditor.windowManager.open({
 *    url: 'file.htm',
 *    width: 320,
 *    height: 240
 * }, {
 *    custom_param: 1
 * });
 */

/**
 * Notification manager reference, use this to open new windows and dialogs.
 *
 * @property notificationManager
 * @type tinymce.NotificationManager
 * @example
 * // Shows a notification info message.
 * tinymce.activeEditor.notificationManager.open({text: 'Hello world!', type: 'info'});
 */

/**
 * Reference to the theme instance that was used to generate the UI.
 *
 * @property theme
 * @type tinymce.Theme
 * @example
 * // Executes a method on the theme directly
 * tinymce.activeEditor.theme.someMethod();
 */
