/**
 * This file contains the documentation for all TinyMCE Editor events.
 */

// Native DOM events:
// focusin focusout click dblclick mousedown mouseup mousemove mouseover beforepaste paste cut copy selectionchange
// mouseout mouseenter mouseleave keydown keypress keyup contextmenu dragend dragover draggesture dragdrop drop drag

// Custom events:
// BeforeRenderUI SetAttrib PreInit (PostRender) init deactivate activate NodeChange BeforeExecCommand ExecCommand show hide
// ProgressState LoadContent SaveContent BeforeSetContent SetContent BeforeGetContent GetContent (VisualAid) remove submit reset
// BeforeAddUndo AddUndo change undo redo (ClearUndos) ObjectSelected ObjectResizeStart ObjectResized PreProcess PostProcess focus blur

// Plugin events:
// autosave: StoreDraft, RestoreDraft
// paste: PastePreProcess,
// fullscreen: FullscreenStateChanged
// spellcheck: SpellcheckStart, SpellcheckEnd

/**
 * Fires before the UI gets rendered.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('BeforeRenderUI', function(e) {
 *             console.log('BeforeRenderUI event', e);
 *         });
 *     }
 * });
 *
 * @event BeforeRenderUI
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when attributes are updated on DOM elements.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('SetAttrib', function(e) {
 *             console.log('SetAttrib event', e);
 *         });
 *     }
 * });
 *
 * @event SetAttrib
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires before the editor has been initialized. This is before any contents gets inserted into the editor but
 * after we have selection and dom instances.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('PreInit', function(e) {
 *             console.log('PreInit event', e);
 *         });
 *     }
 * });
 *
 * @event PreInit
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires after the editor has been initialized. This is after the editor has been filled with contents.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('init', function(e) {
 *             console.log('init event', e);
 *         });
 *     }
 * });
 *
 * @event init
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when the focus is moved from one editor to another editor.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('deactivate', function(e) {
 *             console.log('deactivate event', e);
 *         });
 *     }
 * });
 *
 * @event deactivate
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when the focus is moved from one editor to another editor.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('activate', function(e) {
 *             console.log('activate event', e);
 *         });
 *     }
 * });
 *
 * @event activate
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when the selection is moved to a new location or is the DOM is updated by some command.
 * This event enables you to update the UI based on the current selection etc.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('NodeChange', function(e) {
 *             console.log('NodeChange event', e);
 *         });
 *     }
 * });
 *
 * @event NodeChange
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires before a execCommand call is made. This enables you to prevent it and replace the logic
 * with custom logic.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('BeforeExecCommand', function(e) {
 *             console.log('BeforeExecCommand event', e);
 *         });
 *     }
 * });
 *
 * @event BeforeExecCommand
 * @param {tinymce.CommandEvent} e Event arguments.
 */

/**
 * Fires after a execCommand call has been made.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('ExecCommand', function(e) {
 *             console.log('ExecCommand event', e);
 *         });
 *     }
 * });
 *
 * @event ExecCommand
 * @param {tinymce.CommandEvent} e Event arguments.
 */


/**
 * Fires when the editor is shown.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('show', function(e) {
 *             console.log('show event', e);
 *         });
 *     }
 * });
 *
 * @event show
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when the editor is hidden.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('hide', function(e) {
 *             console.log('hide event', e);
 *         });
 *     }
 * });
 *
 * @event hide
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when a progress event is made. To display a throbber/loader.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('ProgressState', function(e) {
 *             console.log('ProgressState event', e);
 *         });
 *     }
 * });
 *
 * @event ProgressState
 * @param {tinymce.ProgressStateEvent} e Event arguments.
 */

/**
 * Fires after contents has been loaded into the editor.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('LoadContent', function(e) {
 *             console.log('LoadContent event', e);
 *         });
 *     }
 * });
 *
 * @event LoadContent
 * @param {tinymce.ContentEvent} e Event arguments.
 */

/**
 * Fires after contents has been saved/extracted from the editor.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('SaveContent', function(e) {
 *             console.log('SaveContent event', e);
 *         });
 *     }
 * });
 *
 * @event SaveContent
 * @param {tinymce.ContentEvent} e Event arguments.
 */

/**
 * Fires before contents is inserted into the editor.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('BeforeSetContent', function(e) {
 *             console.log('BeforeSetContent event', e);
 *         });
 *     }
 * });
 *
 * @event BeforeSetContent
 * @param {tinymce.ContentEvent} e Event arguments.
 */

/**
 * Fires after contents has been extracted from the editor.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('GetContent', function(e) {
 *             console.log('GetContent event', e);
 *         });
 *     }
 * });
 *
 * @event GetContent
 * @param {tinymce.ContentEvent} e Event arguments.
 */

/**
 * Fires when the editor instance is removed.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('remove', function(e) {
 *             console.log('remove event', e);
 *         });
 *     }
 * });
 *
 * @event remove
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when the form containing the editor is submitted.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('submit', function(e) {
 *             console.log('submit event', e);
 *         });
 *     }
 * });
 *
 * @event submit
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when the form containing the editor is resetted.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('reset', function(e) {
 *             console.log('reset event', e);
 *         });
 *     }
 * });
 *
 * @event reset
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires before an undo level is added to the editor.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('BeforeAddUndo', function(e) {
 *             console.log('BeforeAddUndo event', e);
 *         });
 *     }
 * });
 *
 * @event BeforeAddUndo
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires after an undo level has been added to the editor.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('AddUndo', function(e) {
 *             console.log('AddUndo event', e);
 *         });
 *     }
 * });
 *
 * @event AddUndo
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when contents is modified in the editor.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('change', function(e) {
 *             console.log('change event', e);
 *         });
 *     }
 * });
 *
 * @event change
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when an undo operation is executed.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('undo', function(e) {
 *             console.log('undo event', e);
 *         });
 *     }
 * });
 *
 * @event undo
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when an redo operation is executed.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('redo', function(e) {
 *             console.log('redo event', e);
 *         });
 *     }
 * });
 *
 * @event redo
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when an object is selected such as an image.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('ObjectSelected', function(e) {
 *             console.log('ObjectSelected event', e);
 *         });
 *     }
 * });
 *
 * @event ObjectSelected
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when a resize of an object like an image is about to start.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('ObjectResizeStart', function(e) {
 *             console.log('ObjectResizeStart event', e);
 *         });
 *     }
 * });
 *
 * @event ObjectResizeStart
 * @param {tinymce.ResizeEvent} e Event arguments.
 */

/**
 * Fires after an object like an image is resized.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('ObjectResized', function(e) {
 *             console.log('ObjectResized event', e);
 *         });
 *     }
 * });
 *
 * @event ObjectResized
 * @param {tinymce.ResizeEvent} e Event arguments.
 */

/**
 * Fires before the contents is processed.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('PreProcess', function(e) {
 *             console.log('PreProcess event', e);
 *         });
 *     }
 * });
 *
 * @event PreProcess
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires after the contents has been processed.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('PostProcess', function(e) {
 *             console.log('PostProcess event', e);
 *         });
 *     }
 * });
 *
 * @event PostProcess
 * @param {tinymce.Event} e Event arguments.
 */

/**
 * Fires when the editor gets focused.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('focus', function(e) {
 *             console.log('focus event', e);
 *         });
 *     }
 * });
 *
 * @event focus
 * @param {tinymce.FocusEvent} e Event arguments.
 */

/**
 * Fires when the editor is blurred.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('blur', function(e) {
 *             console.log('blur event', e);
 *         });
 *     }
 * });
 *
 * @event blur
 * @param {tinymce.FocusEvent} e Event arguments.
 */

/**
 * Fires when the editor becomes dirty.
 *
 * @example
 * tinymce.init({
 *     ...
 *     setup: function(editor) {
 *         editor.on('dirty', function(e) {
 *             console.log('Editor is dirty', e);
 *         });
 *     }
 * });
 *
 * @event dirty
 * @param {tinymce.Event} e Event arguments.
 */
