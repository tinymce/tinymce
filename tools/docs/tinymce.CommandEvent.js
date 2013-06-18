/**
 * This class is the event object send when the BeforeExecCommand and ExecCommand event occurs.
 *
 * @class tinymce.CommandEvent
 * @extends tinymce.Event
 * @example
 * tinymce.activeEditor.on('ExecCommand', function(e) {
 *     console.log(e.command, e.ui, e.value);
 * });
 */

/**
 * Name of the command to execute.
 *
 * @property {String} command
 */

/**
 * User interface state. Normally false.
 *
 * @property {Boolean} ui User interface state.
 */

/**
 * Value object for the execCommand call.
 *
 * @property {Object} value
 */
