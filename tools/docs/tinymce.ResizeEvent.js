/**
 * This class is the event object sent when objects gets resized within the editor.
 *
 * @class tinymce.ResizeEvent
 * @extends tinymce.Event
 * @example
 * tinymce.activeEditor.on('ObjectResizeStart', function(e) {
 *     if (e.target.nodeName == 'IMG') {
 *         // Prevent resize
 *         e.preventDefault();
 *     }
 * });
 *
 * tinymce.activeEditor.on('ObjectResized', function(e) {
 *     console.log(e.target, e.width, e.height);
 * });
 */

/**
 * Current element that is to be resized or has been resized.
 *
 * @property {DOMElement} target
 */

/**
 * Current width of the object before or after resize.
 *
 * @property {Number} width
 */

/**
 * Current height of the object before or after resize.
 *
 * @property {Number} height
 */
