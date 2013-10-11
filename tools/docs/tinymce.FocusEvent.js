/**
 * This class is the event object sent when editors are focused/blurred.
 *
 * @class tinymce.FocusEvent
 * @extends tinymce.Event
 * @example
 * tinymce.activeEditor.on('focus', function(e) {
 *     console.log(e.blurredEditor);
 * });
 *
 * tinymce.activeEditor.on('blur', function(e) {
 *     console.log(e.focusedEditor);
 * });
 */

/**
 * Optional editor instance that got the focus when the blur event occurs.
 *
 * @property {tinymce.Editor} focusedEditor
 */

/**
 * Optional editor instance that got blurred when the focus event occurs.
 *
 * @property {tinymce.Editor} blurredEditor
 */
