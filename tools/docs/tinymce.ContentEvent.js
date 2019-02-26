/**
 * This class is the event object send when the content events occurs such as GetContent/SetContent.
 *
 * @class tinymce.ContentEvent
 * @extends tinymce.Event
 * @example
 * tinymce.activeEditor.on('GetContent', function(e) {
 *     console.log(e.content);
 * });
 */

/**
 * Optional state gets added for the load event then it's set to true.
 *
 * @property {Boolean} load
 */

/**
 * Optional state gets added for the save event then it's set to true.
 *
 * @property {Boolean} save
 */

/**
 * Optional state gets added for the getContent event then it's set to true.
 *
 * @property {Boolean} set
 */

/**
 * Optional state gets added for the setContent event then it's set to true.
 *
 * @property {Boolean} get
 */

/**
 * Optional element that the load/save event is for. This element is the textarea/div element that the
 * contents gets parsed from or serialized to.
 *
 * @property {DOMElement} element
 */

/**
 * Editor contents to be set or the content that was returned from the editor.
 *
 * @property {String} content HTML contents from the editor or to be put into the editor.
 */

/**
 * Format of the contents normally "html".
 *
 * @property {String} format Format of the contents normally "html".
 */
