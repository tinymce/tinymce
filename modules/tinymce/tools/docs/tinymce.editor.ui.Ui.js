/**
 * This editor ui instance.
 *
 * @class tinymce.editor.ui.Ui
 */

/**
 * Editor UI registry instance.
 *
 * @property registry
 * @type tinymce.editor.ui.Registry
 */

/**
 * Reveals the editor user interface for inline editors. This method affects all user
 * interface elements, including: menu bar, toolbar, notifications, and dialogs.
 * <br>
 * If the `toolbar_persist` option is set to `true` and this method is used,
 * the user interface will remain visible, regardless of focus.
 * <br>
 * <em>Added in TinyMCE 5.5</em>
 *
 * @method tinymce.editor.ui.show
 */

/**
 * Hides the editor user interface for inline editors. This method affects all user
 * interface elements, including: menu bar, toolbar, notifications, and dialogs.
 * <br>
 * If the `toolbar_persist` option is set to `true` and this method is used,
 * the user interface will remain hidden, regardless of focus.
 * <br>
 * <em>Added in TinyMCE 5.5</em>
 *
 * @method tinymce.editor.ui.hide
 */

/**
 * Enables the editor user interface. This method affects all user interface
 * elements, including: menu bar, toolbar, notifications, and dialogs. Can
 * not be used when in readonly mode.
 * <br>
 * <em>Added in TinyMCE 5.6</em>
 *
 * @method tinymce.editor.ui.enable
 */

/**
 * Disables the editor user interface. This method affects all user interface
 * elements, including: menu bar, toolbar, notifications, and dialogs.
 * <br>
 * <em>Added in TinyMCE 5.6</em>
 *
 * @method tinymce.editor.ui.disable
 */

/**
 * Determines if the editor user interface is `disabled` (`true`) or not (`false`).
 * <br>
 * <em>Added in TinyMCE 5.6</em>
 *
 * @method tinymce.editor.ui.isDisabled
 * @return {Boolean} true/false if the editor user interface is `disabled` (`true`) or not (`false`).
 */

/**
 * Editor UI stylesheet loader instance. StyleSheetLoader for styles in the editor UI. For content styles, use editor.dom.styleSheetLoader.
 * <br>
 * <em>Added in TinyMCE 5.4</em>
 *
 * @property styleSheetLoader
 * @type tinymce.dom.StyleSheetLoader
 */
