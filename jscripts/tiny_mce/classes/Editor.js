/**
 * Editor.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten these names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, extend = tinymce.extend,
		Dispatcher = tinymce.util.Dispatcher, each = tinymce.each, isGecko = tinymce.isGecko,
		isIE = tinymce.isIE, isWebKit = tinymce.isWebKit, is = tinymce.is,
		ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager,
		inArray = tinymce.inArray, grep = tinymce.grep, explode = tinymce.explode, VK = tinymce.VK;

	/**
	 * This class contains the core logic for a TinyMCE editor.
	 *
	 * @class tinymce.Editor
	 * @example
	 * // Add a class to all paragraphs in the editor.
	 * tinyMCE.activeEditor.dom.addClass(tinyMCE.activeEditor.dom.select('p'), 'someclass');
	 * 
	 * // Gets the current editors selection as text
	 * tinyMCE.activeEditor.selection.getContent({format : 'text'});
	 * 
	 * // Creates a new editor instance
	 * var ed = new tinymce.Editor('textareaid', {
	 *     some_setting : 1
	 * });
	 * 
	 * // Select each item the user clicks on
	 * ed.onClick.add(function(ed, e) {
	 *     ed.selection.select(e.target);
	 * });
	 * 
	 * ed.render();
	 */
	tinymce.create('tinymce.Editor', {
		/**
		 * Constructs a editor instance by id.
		 *
		 * @constructor
		 * @method Editor
		 * @param {String} id Unique id for the editor.
		 * @param {Object} s Optional settings string for the editor.
		 * @author Moxiecode
		 */
		Editor : function(id, s) {
			var t = this;

			/**
			 * Editor instance id, normally the same as the div/textarea that was replaced. 
			 *
			 * @property id
			 * @type String
			 */
			t.id = t.editorId = id;

			t.execCommands = {};
			t.queryStateCommands = {};
			t.queryValueCommands = {};

			/**
			 * State to force the editor to return false on a isDirty call. 
			 *
			 * @property isNotDirty
			 * @type Boolean
			 * @example
			 * function ajaxSave() {
			 *     var ed = tinyMCE.get('elm1');
			 *
			 *     // Save contents using some XHR call
			 *     alert(ed.getContent());
			 *
			 *     ed.isNotDirty = 1; // Force not dirty state
			 * }
			 */
			t.isNotDirty = false;

			/**
			 * Name/Value object containting plugin instances.
			 *
			 * @property plugins
			 * @type Object
			 * @example
			 * // Execute a method inside a plugin directly
			 * tinyMCE.activeEditor.plugins.someplugin.someMethod();
			 */
			t.plugins = {};

			// Add events to the editor
			each([
				/**
				 * Fires before the initialization of the editor.
				 *
				 * @event onPreInit
				 * @param {tinymce.Editor} sender Editor instance.
				 * @see #onInit
				 * @example
				 * // Adds an observer to the onPreInit event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onPreInit.add(function(ed) {
				 *           console.debug('PreInit: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onPreInit',

				/**
				 * Fires before the initialization of the editor.
				 *
				 * @event onBeforeRenderUI
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onBeforeRenderUI event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
 				 *      ed.onBeforeRenderUI.add(function(ed, cm) {
 				 *          console.debug('Before render: ' + ed.id);
 				 *      });
				 *    }
				 * });
				 */
				'onBeforeRenderUI',

				/**
				 * Fires after the rendering has completed.
				 *
				 * @event onPostRender
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onPostRender event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onPostRender.add(function(ed, cm) {
				 *           console.debug('After render: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onPostRender',

				/**
				 * Fires after the initialization of the editor is done.
				 *
				 * @event onInit
				 * @param {tinymce.Editor} sender Editor instance.
				 * @see #onPreInit
				 * @example
				 * // Adds an observer to the onInit event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onInit.add(function(ed) {
				 *           console.debug('Editor is done: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onInit',

				/**
				 * Fires when the editor instance is removed from page.
				 *
				 * @event onRemove
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onRemove event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onRemove.add(function(ed) {
				 *           console.debug('Editor was removed: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onRemove',

				/**
				 * Fires when the editor is activated.
				 *
				 * @event onActivate
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onActivate event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onActivate.add(function(ed) {
				 *           console.debug('Editor was activated: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onActivate',

				/**
				 * Fires when the editor is deactivated.
				 *
				 * @event onDeactivate
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onDeactivate event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onDeactivate.add(function(ed) {
				 *           console.debug('Editor was deactivated: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onDeactivate',

				/**
				 * Fires when something in the body of the editor is clicked.
				 *
				 * @event onClick
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onClick event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onClick.add(function(ed, e) {
				 *           console.debug('Editor was clicked: ' + e.target.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onClick',

				/**
				 * Fires when a registered event is intercepted.
				 *
				 * @event onEvent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onEvent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onEvent.add(function(ed, e) {
 				 *          console.debug('Editor event occured: ' + e.target.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onEvent',

				/**
				 * Fires when a mouseup event is intercepted inside the editor.
				 *
				 * @event onMouseUp
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onMouseUp event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onMouseUp.add(function(ed, e) {
				 *           console.debug('Mouse up event: ' + e.target.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onMouseUp',

				/**
				 * Fires when a mousedown event is intercepted inside the editor.
				 *
				 * @event onMouseDown
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onMouseDown event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onMouseDown.add(function(ed, e) {
				 *           console.debug('Mouse down event: ' + e.target.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onMouseDown',

				/**
				 * Fires when a dblclick event is intercepted inside the editor.
				 *
				 * @event onDblClick
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onDblClick event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onDblClick.add(function(ed, e) {
 				 *          console.debug('Double click event: ' + e.target.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onDblClick',

				/**
				 * Fires when a keydown event is intercepted inside the editor.
				 *
				 * @event onKeyDown
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onKeyDown event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onKeyDown.add(function(ed, e) {
				 *           console.debug('Key down event: ' + e.keyCode);
				 *       });
				 *    }
				 * });
				 */
				'onKeyDown',

				/**
				 * Fires when a keydown event is intercepted inside the editor.
				 *
				 * @event onKeyUp
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onKeyUp event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onKeyUp.add(function(ed, e) {
				 *           console.debug('Key up event: ' + e.keyCode);
				 *       });
				 *    }
				 * });
				 */
				'onKeyUp',

				/**
				 * Fires when a keypress event is intercepted inside the editor.
				 *
				 * @event onKeyPress
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onKeyPress event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onKeyPress.add(function(ed, e) {
				 *           console.debug('Key press event: ' + e.keyCode);
				 *       });
				 *    }
				 * });
				 */
				'onKeyPress',

				/**
				 * Fires when a contextmenu event is intercepted inside the editor.
				 *
				 * @event onContextMenu
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onContextMenu event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onContextMenu.add(function(ed, e) {
				 *            console.debug('Context menu event:' + e.target);
				 *       });
				 *    }
				 * });
				 */
				'onContextMenu',

				/**
				 * Fires when a form submit event is intercepted.
				 *
				 * @event onSubmit
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onSubmit event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onSubmit.add(function(ed, e) {
				 *            console.debug('Form submit:' + e.target);
				 *       });
				 *    }
				 * });
				 */
				'onSubmit',

				/**
				 * Fires when a form reset event is intercepted.
				 *
				 * @event onReset
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onReset event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onReset.add(function(ed, e) {
				 *            console.debug('Form reset:' + e.target);
				 *       });
				 *    }
				 * });
				 */
				'onReset',

				/**
				 * Fires when a paste event is intercepted inside the editor.
				 *
				 * @event onPaste
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onPaste event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onPaste.add(function(ed, e) {
				 *            console.debug('Pasted plain text');
				 *       });
				 *    }
				 * });
				 */
				'onPaste',

				/**
				 * Fires when the Serializer does a preProcess on the contents.
				 *
				 * @event onPreProcess
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Object} obj PreProcess object.
				 * @option {Node} node DOM node for the item being serialized.
				 * @option {String} format The specified output format normally "html".
				 * @option {Boolean} get Is true if the process is on a getContent operation.
				 * @option {Boolean} set Is true if the process is on a setContent operation.
				 * @option {Boolean} cleanup Is true if the process is on a cleanup operation.
				 * @example
				 * // Adds an observer to the onPreProcess event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onPreProcess.add(function(ed, o) {
				 *            // Add a class to each paragraph in the editor
				 *            ed.dom.addClass(ed.dom.select('p', o.node), 'myclass');
				 *       });
				 *    }
				 * });
				 */
				'onPreProcess',

				/**
				 * Fires when the Serializer does a postProcess on the contents.
				 *
				 * @event onPostProcess
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Object} obj PreProcess object.
				 * @example
				 * // Adds an observer to the onPostProcess event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onPostProcess.add(function(ed, o) {
				 *            // Remove all paragraphs and replace with BR
				 *            o.content = o.content.replace(/<p[^>]+>|<p>/g, '');
				 *            o.content = o.content.replace(/<\/p>/g, '<br />');
				 *       });
				 *    }
				 * });
				 */
				'onPostProcess',

				/**
				 * Fires before new contents is added to the editor. Using for example setContent.
				 *
				 * @event onBeforeSetContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onBeforeSetContent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onBeforeSetContent.add(function(ed, o) {
				 *            // Replaces all a characters with b characters
				 *            o.content = o.content.replace(/a/g, 'b');
				 *       });
				 *    }
				 * });
				 */
				'onBeforeSetContent',

				/**
				 * Fires before contents is extracted from the editor using for example getContent.
				 *
				 * @event onBeforeGetContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onBeforeGetContent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onBeforeGetContent.add(function(ed, o) {
				 *            console.debug('Before get content.');
				 *       });
				 *    }
				 * });
				 */
				'onBeforeGetContent',

				/**
				 * Fires after the contents has been added to the editor using for example onSetContent.
				 *
				 * @event onSetContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onSetContent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onSetContent.add(function(ed, o) {
				 *            // Replaces all a characters with b characters
				 *            o.content = o.content.replace(/a/g, 'b');
				 *       });
				 *    }
				 * });
				 */
				'onSetContent',

				/**
				 * Fires after the contents has been extracted from the editor using for example getContent.
				 *
				 * @event onGetContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onGetContent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onGetContent.add(function(ed, o) {
				 *           // Replace all a characters with b
				 *           o.content = o.content.replace(/a/g, 'b');
				 *       });
				 *    }
				 * });
				 */
				'onGetContent',

				/**
				 * Fires when the editor gets loaded with contents for example when the load method is executed.
				 *
				 * @event onLoadContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onLoadContent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onLoadContent.add(function(ed, o) {
				 *           // Output the element name
				 *           console.debug(o.element.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onLoadContent',

				/**
				 * Fires when the editor contents gets saved for example when the save method is executed.
				 *
				 * @event onSaveContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onSaveContent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onSaveContent.add(function(ed, o) {
				 *           // Output the element name
				 *           console.debug(o.element.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onSaveContent',

				/**
				 * Fires when the user changes node location using the mouse or keyboard.
				 *
				 * @event onNodeChange
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onNodeChange event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onNodeChange.add(function(ed, cm, e) {
				 *           // Activates the link button when the caret is placed in a anchor element
				 *           if (e.nodeName == 'A')
				 *              cm.setActive('link', true);
				 *       });
				 *    }
				 * });
				 */
				'onNodeChange',

				/**
				 * Fires when a new undo level is added to the editor.
				 *
				 * @event onChange
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onChange event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 * 	  ed.onChange.add(function(ed, l) {
				 * 		  console.debug('Editor contents was modified. Contents: ' + l.content);
				 * 	  });
				 *    }
				 * });
				 */
				'onChange',

				/**
				 * Fires before a command gets executed for example "Bold".
				 *
				 * @event onBeforeExecCommand
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onBeforeExecCommand event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onBeforeExecCommand.add(function(ed, cmd, ui, val) {
				 *           console.debug('Command is to be executed: ' + cmd);
				 *       });
				 *    }
				 * });
				 */
				'onBeforeExecCommand',

				/**
				 * Fires after a command is executed for example "Bold".
				 *
				 * @event onExecCommand
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onExecCommand event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onExecCommand.add(function(ed, cmd, ui, val) {
				 *           console.debug('Command was executed: ' + cmd);
				 *       });
				 *    }
				 * });
				 */
				'onExecCommand',

				/**
				 * Fires when the contents is undo:ed.
				 *
				 * @event onUndo
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Object} level Undo level object.
				 * @ example
				 * // Adds an observer to the onUndo event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onUndo.add(function(ed, level) {
				 *           console.debug('Undo was performed: ' + level.content);
				 *       });
				 *    }
				 * });
				 */
				'onUndo',

				/**
				 * Fires when the contents is redo:ed.
				 *
				 * @event onRedo
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Object} level Undo level object.
				 * @example
				 * // Adds an observer to the onRedo event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onRedo.add(function(ed, level) {
				 *           console.debug('Redo was performed: ' +level.content);
				 *       });
				 *    }
				 * });
				 */
				'onRedo',

				/**
				 * Fires when visual aids is enabled/disabled.
				 *
				 * @event onVisualAid
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onVisualAid event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onVisualAid.add(function(ed, e, s) {
				 *           console.debug('onVisualAid event: ' + ed.id + ", State: " + s);
				 *       });
				 *    }
				 * });
				 */
				'onVisualAid',

				/**
				 * Fires when the progress throbber is shown above the editor.
				 *
				 * @event onSetProgressState
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onSetProgressState event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onSetProgressState.add(function(ed, b) {
				 *            if (b)
				 *                 console.debug('SHOW!');
				 *            else
				 *                 console.debug('HIDE!');
				 *       });
				 *    }
				 * });
				 */
				'onSetProgressState'
			], function(e) {
				t[e] = new Dispatcher(t);
			});

			/**
			 * Name/value collection with editor settings.
			 *
			 * @property settings
			 * @type Object
			 * @example
			 * // Get the value of the theme setting
			 * tinyMCE.activeEditor.windowManager.alert("You are using the " + tinyMCE.activeEditor.settings.theme + " theme");
			 */
			t.settings = s = extend({
				id : id,
				language : 'en',
				docs_language : 'en',
				theme : 'simple',
				skin : 'default',
				delta_width : 0,
				delta_height : 0,
				popup_css : '',
				plugins : '',
				document_base_url : tinymce.documentBaseURL,
				add_form_submit_trigger : 1,
				submit_patch : 1,
				add_unload_trigger : 1,
				convert_urls : 1,
				relative_urls : 1,
				remove_script_host : 1,
				table_inline_editing : 0,
				object_resizing : 1,
				cleanup : 1,
				accessibility_focus : 1,
				custom_shortcuts : 1,
				custom_undo_redo_keyboard_shortcuts : 1,
				custom_undo_redo_restore_selection : 1,
				custom_undo_redo : 1,
				doctype : tinymce.isIE6 ? '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">' : '<!DOCTYPE>', // Use old doctype on IE 6 to avoid horizontal scroll
				visual_table_class : 'mceItemTable',
				visual : 1,
				font_size_style_values : 'xx-small,x-small,small,medium,large,x-large,xx-large',
				font_size_legacy_values : 'xx-small,small,medium,large,x-large,xx-large,300%', // See: http://www.w3.org/TR/CSS2/fonts.html#propdef-font-size
				apply_source_formatting : 1,
				directionality : 'ltr',
				forced_root_block : 'p',
				hidden_input : 1,
				padd_empty_editor : 1,
				render_ui : 1,
				init_theme : 1,
				force_p_newlines : 1,
				indentation : '30px',
				keep_styles : 1,
				fix_table_elements : 1,
				inline_styles : 1,
				convert_fonts_to_spans : true,
				indent : 'simple',
				indent_before : 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,tfoot,tbody,tr',
				indent_after : 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,tfoot,tbody,tr',
				validate : true,
				entity_encoding : 'named',
				url_converter : t.convertURL,
				url_converter_scope : t,
				ie7_compat : true
			}, s);

			/**
			 * URI object to document configured for the TinyMCE instance.
			 *
			 * @property documentBaseURI
			 * @type tinymce.util.URI
			 * @example
			 * // Get relative URL from the location of document_base_url
			 * tinyMCE.activeEditor.documentBaseURI.toRelative('/somedir/somefile.htm');
			 * 
			 * // Get absolute URL from the location of document_base_url
			 * tinyMCE.activeEditor.documentBaseURI.toAbsolute('somefile.htm');
			 */
			t.documentBaseURI = new tinymce.util.URI(s.document_base_url || tinymce.documentBaseURL, {
				base_uri : tinyMCE.baseURI
			});

			/**
			 * URI object to current document that holds the TinyMCE editor instance.
			 *
			 * @property baseURI
			 * @type tinymce.util.URI
			 * @example
			 * // Get relative URL from the location of the API
			 * tinyMCE.activeEditor.baseURI.toRelative('/somedir/somefile.htm');
			 * 
			 * // Get absolute URL from the location of the API
			 * tinyMCE.activeEditor.baseURI.toAbsolute('somefile.htm');
			 */
			t.baseURI = tinymce.baseURI;

			/**
			 * Array with CSS files to load into the iframe.
			 *
			 * @property contentCSS
			 * @type Array
			 */			
			t.contentCSS = [];

			// Call setup
			t.execCallback('setup', t);
		},

		/**
		 * Renderes the editor/adds it to the page.
		 *
		 * @method render
		 */
		render : function(nst) {
			var t = this, s = t.settings, id = t.id, sl = tinymce.ScriptLoader;

			// Page is not loaded yet, wait for it
			if (!Event.domLoaded) {
				Event.add(document, 'init', function() {
					t.render();
				});
				return;
			}

			tinyMCE.settings = s;

			// Element not found, then skip initialization
			if (!t.getElement())
				return;

			// Is a iPad/iPhone and not on iOS5, then skip initialization. We need to sniff 
			// here since the browser says it has contentEditable support but there is no visible
			// caret We will remove this check ones Apple implements full contentEditable support
			if (tinymce.isIDevice && !tinymce.isIOS5)
				return;

			// Add hidden input for non input elements inside form elements
			if (!/TEXTAREA|INPUT/i.test(t.getElement().nodeName) && s.hidden_input && DOM.getParent(id, 'form'))
				DOM.insertAfter(DOM.create('input', {type : 'hidden', name : id}), id);

			/**
			 * Window manager reference, use this to open new windows and dialogs.
			 *
			 * @property windowManager
			 * @type tinymce.WindowManager
			 * @example
			 * // Shows an alert message
			 * tinyMCE.activeEditor.windowManager.alert('Hello world!');
			 * 
			 * // Opens a new dialog with the file.htm file and the size 320x240
			 * // It also adds a custom parameter this can be retrieved by using tinyMCEPopup.getWindowArg inside the dialog.
			 * tinyMCE.activeEditor.windowManager.open({
			 *    url : 'file.htm',
			 *    width : 320,
			 *    height : 240
			 * }, {
			 *    custom_param : 1
			 * });
			 */
			if (tinymce.WindowManager)
				t.windowManager = new tinymce.WindowManager(t);

			if (s.encoding == 'xml') {
				t.onGetContent.add(function(ed, o) {
					if (o.save)
						o.content = DOM.encode(o.content);
				});
			}

			if (s.add_form_submit_trigger) {
				t.onSubmit.addToTop(function() {
					if (t.initialized) {
						t.save();
						t.isNotDirty = 1;
					}
				});
			}

			if (s.add_unload_trigger) {
				t._beforeUnload = tinyMCE.onBeforeUnload.add(function() {
					if (t.initialized && !t.destroyed && !t.isHidden())
						t.save({format : 'raw', no_events : true});
				});
			}

			tinymce.addUnload(t.destroy, t);

			if (s.submit_patch) {
				t.onBeforeRenderUI.add(function() {
					var n = t.getElement().form;

					if (!n)
						return;

					// Already patched
					if (n._mceOldSubmit)
						return;

					// Check page uses id="submit" or name="submit" for it's submit button
					if (!n.submit.nodeType && !n.submit.length) {
						t.formElement = n;
						n._mceOldSubmit = n.submit;
						n.submit = function() {
							// Save all instances
							tinymce.triggerSave();
							t.isNotDirty = 1;

							return t.formElement._mceOldSubmit(t.formElement);
						};
					}

					n = null;
				});
			}

			// Load scripts
			function loadScripts() {
				if (s.language && s.language_load !== false)
					sl.add(tinymce.baseURL + '/langs/' + s.language + '.js');

				if (s.theme && s.theme.charAt(0) != '-' && !ThemeManager.urls[s.theme])
					ThemeManager.load(s.theme, 'themes/' + s.theme + '/editor_template' + tinymce.suffix + '.js');

				each(explode(s.plugins), function(p) {
					if (p &&!PluginManager.urls[p]) {
						if (p.charAt(0) == '-') {
							p = p.substr(1, p.length);
							var dependencies = PluginManager.dependencies(p);
							each(dependencies, function(dep) {
								var defaultSettings = {prefix:'plugins/', resource: dep, suffix:'/editor_plugin' + tinymce.suffix + '.js'};
								var dep = PluginManager.createUrl(defaultSettings, dep);
								PluginManager.load(dep.resource, dep);
								
							});
						} else {
							// Skip safari plugin, since it is removed as of 3.3b1
							if (p == 'safari') {
								return;
							}
							PluginManager.load(p, {prefix:'plugins/', resource: p, suffix:'/editor_plugin' + tinymce.suffix + '.js'});
						}
					}
				});

				// Init when que is loaded
				sl.loadQueue(function() {
					if (!t.removed)
						t.init();
				});
			};

			loadScripts();
		},

		/**
		 * Initializes the editor this will be called automatically when
		 * all plugins/themes and language packs are loaded by the rendered method.
		 * This method will setup the iframe and create the theme and plugin instances.
		 *
		 * @method init
		 */
		init : function() {
			var n, t = this, s = t.settings, w, h, e = t.getElement(), o, ti, u, bi, bc, re, i, initializedPlugins = [];

			tinymce.add(t);

			s.aria_label = s.aria_label || DOM.getAttrib(e, 'aria-label', t.getLang('aria.rich_text_area'));

			/**
			 * Reference to the theme instance that was used to generate the UI. 
			 *
			 * @property theme
			 * @type tinymce.Theme
			 * @example
			 * // Executes a method on the theme directly
			 * tinyMCE.activeEditor.theme.someMethod();
			 */
			if (s.theme) {
				s.theme = s.theme.replace(/-/, '');
				o = ThemeManager.get(s.theme);
				t.theme = new o();

				if (t.theme.init && s.init_theme)
					t.theme.init(t, ThemeManager.urls[s.theme] || tinymce.documentBaseURL.replace(/\/$/, ''));
			}
			function initPlugin(p) {
				var c = PluginManager.get(p), u = PluginManager.urls[p] || tinymce.documentBaseURL.replace(/\/$/, ''), po;
				if (c && tinymce.inArray(initializedPlugins,p) === -1) {
					each(PluginManager.dependencies(p), function(dep){
						initPlugin(dep);
					});
					po = new c(t, u);

					t.plugins[p] = po;

					if (po.init) {
						po.init(t, u);
						initializedPlugins.push(p);
					}
				}
			}
			
			// Create all plugins
			each(explode(s.plugins.replace(/\-/g, '')), initPlugin);

			// Setup popup CSS path(s)
			if (s.popup_css !== false) {
				if (s.popup_css)
					s.popup_css = t.documentBaseURI.toAbsolute(s.popup_css);
				else
					s.popup_css = t.baseURI.toAbsolute("themes/" + s.theme + "/skins/" + s.skin + "/dialog.css");
			}

			if (s.popup_css_add)
				s.popup_css += ',' + t.documentBaseURI.toAbsolute(s.popup_css_add);

			/**
			 * Control manager instance for the editor. Will enables you to create new UI elements and change their states etc.
			 *
			 * @property controlManager
			 * @type tinymce.ControlManager
			 * @example
			 * // Disables the bold button
			 * tinyMCE.activeEditor.controlManager.setDisabled('bold', true);
			 */
			t.controlManager = new tinymce.ControlManager(t);

			if (s.custom_undo_redo) {
				t.onBeforeExecCommand.add(function(ed, cmd, ui, val, a) {
					if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!a || !a.skip_undo))
						t.undoManager.beforeChange();
				});

				t.onExecCommand.add(function(ed, cmd, ui, val, a) {
					if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!a || !a.skip_undo))
						t.undoManager.add();
				});
			}

			t.onExecCommand.add(function(ed, c) {
				// Don't refresh the select lists until caret move
				if (!/^(FontName|FontSize)$/.test(c))
					t.nodeChanged();
			});

			// Remove ghost selections on images and tables in Gecko
			if (isGecko) {
				function repaint(a, o) {
					if (!o || !o.initial)
						t.execCommand('mceRepaint');
				};

				t.onUndo.add(repaint);
				t.onRedo.add(repaint);
				t.onSetContent.add(repaint);
			}

			// Enables users to override the control factory
			t.onBeforeRenderUI.dispatch(t, t.controlManager);

			// Measure box
			if (s.render_ui) {
				w = s.width || e.style.width || e.offsetWidth;
				h = s.height || e.style.height || e.offsetHeight;
				t.orgDisplay = e.style.display;
				re = /^[0-9\.]+(|px)$/i;

				if (re.test('' + w))
					w = Math.max(parseInt(w) + (o.deltaWidth || 0), 100);

				if (re.test('' + h))
					h = Math.max(parseInt(h) + (o.deltaHeight || 0), 100);

				// Render UI
				o = t.theme.renderUI({
					targetNode : e,
					width : w,
					height : h,
					deltaWidth : s.delta_width,
					deltaHeight : s.delta_height
				});

				t.editorContainer = o.editorContainer;
			}

			// #ifdef contentEditable

			// Content editable mode ends here
			if (s.content_editable) {
				e = n = o = null; // Fix IE leak
				return t.setupContentEditable();
			}

			// #endif

			// User specified a document.domain value
			if (document.domain && location.hostname != document.domain)
				tinymce.relaxedDomain = document.domain;

			// Resize editor
			DOM.setStyles(o.sizeContainer || o.editorContainer, {
				width : w,
				height : h
			});

			// Load specified content CSS last
			if (s.content_css) {
				tinymce.each(explode(s.content_css), function(u) {
					t.contentCSS.push(t.documentBaseURI.toAbsolute(u));
				});
			}

			h = (o.iframeHeight || h) + (typeof(h) == 'number' ? (o.deltaHeight || 0) : '');
			if (h < 100)
				h = 100;

			t.iframeHTML = s.doctype + '<html><head xmlns="http://www.w3.org/1999/xhtml">';

			// We only need to override paths if we have to
			// IE has a bug where it remove site absolute urls to relative ones if this is specified
			if (s.document_base_url != tinymce.documentBaseURL)
				t.iframeHTML += '<base href="' + t.documentBaseURI.getURI() + '" />';

			// IE8 doesn't support carets behind images setting ie7_compat would force IE8+ to run in IE7 compat mode.
			if (s.ie7_compat)
				t.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=7" />';
			else
				t.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=edge" />';

			t.iframeHTML += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

			// Load the CSS by injecting them into the HTML this will reduce "flicker"
			for (i = 0; i < t.contentCSS.length; i++) {
				t.iframeHTML += '<link type="text/css" rel="stylesheet" href="' + t.contentCSS[i] + '" />';
			}

			bi = s.body_id || 'tinymce';
			if (bi.indexOf('=') != -1) {
				bi = t.getParam('body_id', '', 'hash');
				bi = bi[t.id] || bi;
			}

			bc = s.body_class || '';
			if (bc.indexOf('=') != -1) {
				bc = t.getParam('body_class', '', 'hash');
				bc = bc[t.id] || '';
			}

			t.iframeHTML += '</head><body id="' + bi + '" class="mceContentBody ' + bc + '"><br></body></html>';

			// Domain relaxing enabled, then set document domain
			if (tinymce.relaxedDomain && (isIE || (tinymce.isOpera && parseFloat(opera.version()) < 11))) {
				// We need to write the contents here in IE since multiple writes messes up refresh button and back button
				u = 'javascript:(function(){document.open();document.domain="' + document.domain + '";var ed = window.parent.tinyMCE.get("' + t.id + '");document.write(ed.iframeHTML);document.close();ed.setupIframe();})()';
			}

			// Create iframe
			// TODO: ACC add the appropriate description on this.
			n = DOM.add(o.iframeContainer, 'iframe', { 
				id : t.id + "_ifr",
				src : u || 'javascript:""', // Workaround for HTTPS warning in IE6/7
				frameBorder : '0',
				allowTransparency : "true",
				title : s.aria_label,
				style : {
					width : '100%',
					height : h,
					display : 'block' // Important for Gecko to render the iframe correctly
				}
			});

			t.contentAreaContainer = o.iframeContainer;
			DOM.get(o.editorContainer).style.display = t.orgDisplay;
			DOM.get(t.id).style.display = 'none';
			DOM.setAttrib(t.id, 'aria-hidden', true);

			if (!tinymce.relaxedDomain || !u)
				t.setupIframe();

			e = n = o = null; // Cleanup
		},

		/**
		 * This method get called by the init method ones the iframe is loaded.
		 * It will fill the iframe with contents, setups DOM and selection objects for the iframe.
		 * This method should not be called directly.
		 *
		 * @method setupIframe
		 */
		setupIframe : function() {
			var t = this, s = t.settings, e = DOM.get(t.id), d = t.getDoc(), h, b;

			// Setup iframe body
			if (!isIE || !tinymce.relaxedDomain) {
				d.open();
				d.write(t.iframeHTML);
				d.close();

				if (tinymce.relaxedDomain)
					d.domain = tinymce.relaxedDomain;
			}

			// It will not steal focus while setting contentEditable
			b = t.getBody();
			b.disabled = true;

			if (!s.readonly)
				b.contentEditable = true;

			b.disabled = false;

			/**
			 * Schema instance, enables you to validate elements and it's children.
			 *
			 * @property schema
			 * @type tinymce.html.Schema
			 */
			t.schema = new tinymce.html.Schema(s);

			/**
			 * DOM instance for the editor.
			 *
			 * @property dom
			 * @type tinymce.dom.DOMUtils
			 * @example
			 * // Adds a class to all paragraphs within the editor
			 * tinyMCE.activeEditor.dom.addClass(tinyMCE.activeEditor.dom.select('p'), 'someclass');
			 */
			t.dom = new tinymce.dom.DOMUtils(t.getDoc(), {
				keep_values : true,
				url_converter : t.convertURL,
				url_converter_scope : t,
				hex_colors : s.force_hex_style_colors,
				class_filter : s.class_filter,
				update_styles : 1,
				fix_ie_paragraphs : 1,
				schema : t.schema
			});

			/**
			 * HTML parser will be used when contents is inserted into the editor.
			 *
			 * @property parser
			 * @type tinymce.html.DomParser
			 */
			t.parser = new tinymce.html.DomParser(s, t.schema);

			// Force anchor names closed, unless the setting "allow_html_in_named_anchor" is explicitly included.
			if (!t.settings.allow_html_in_named_anchor) {
				t.parser.addAttributeFilter('name', function(nodes, name) {
					var i = nodes.length, sibling, prevSibling, parent, node;
	
					while (i--) {
						node = nodes[i];
						if (node.name === 'a' && node.firstChild) {
							parent = node.parent;
	
							// Move children after current node
							sibling = node.lastChild;
							do {
								prevSibling = sibling.prev;
								parent.insert(sibling, node);
								sibling = prevSibling;
							} while (sibling);
						}
					}
				});
			}

			// Convert src and href into data-mce-src, data-mce-href and data-mce-style
			t.parser.addAttributeFilter('src,href,style', function(nodes, name) {
				var i = nodes.length, node, dom = t.dom, value, internalName;

				while (i--) {
					node = nodes[i];
					value = node.attr(name);
					internalName = 'data-mce-' + name;

					// Add internal attribute if we need to we don't on a refresh of the document
					if (!node.attributes.map[internalName]) {	
						if (name === "style")
							node.attr(internalName, dom.serializeStyle(dom.parseStyle(value), node.name));
						else
							node.attr(internalName, t.convertURL(value, name, node.name));
					}
				}
			});

			// Keep scripts from executing
			t.parser.addNodeFilter('script', function(nodes, name) {
				var i = nodes.length, node;

				while (i--) {
					node = nodes[i];
					node.attr('type', 'mce-' + (node.attr('type') || 'text/javascript'));
				}
			});

			t.parser.addNodeFilter('#cdata', function(nodes, name) {
				var i = nodes.length, node;

				while (i--) {
					node = nodes[i];
					node.type = 8;
					node.name = '#comment';
					node.value = '[CDATA[' + node.value + ']]';
				}
			});

			t.parser.addNodeFilter('p,h1,h2,h3,h4,h5,h6,div', function(nodes, name) {
				var i = nodes.length, node, nonEmptyElements = t.schema.getNonEmptyElements();

				while (i--) {
					node = nodes[i];

					if (node.isEmpty(nonEmptyElements))
						node.empty().append(new tinymce.html.Node('br', 1)).shortEnded = true;
				}
			});

			/**
			 * DOM serializer for the editor. Will be used when contents is extracted from the editor.
			 *
			 * @property serializer
			 * @type tinymce.dom.Serializer
			 * @example
			 * // Serializes the first paragraph in the editor into a string
			 * tinyMCE.activeEditor.serializer.serialize(tinyMCE.activeEditor.dom.select('p')[0]);
			 */
			t.serializer = new tinymce.dom.Serializer(s, t.dom, t.schema);

			/**
			 * Selection instance for the editor.
			 *
			 * @property selection
			 * @type tinymce.dom.Selection
			 * @example
			 * // Sets some contents to the current selection in the editor
			 * tinyMCE.activeEditor.selection.setContent('Some contents');
			 *
			 * // Gets the current selection
			 * alert(tinyMCE.activeEditor.selection.getContent());
			 *
			 * // Selects the first paragraph found
			 * tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.dom.select('p')[0]);
			 */
			t.selection = new tinymce.dom.Selection(t.dom, t.getWin(), t.serializer);

			/**
			 * Formatter instance.
			 *
			 * @property formatter
			 * @type tinymce.Formatter
			 */
			t.formatter = new tinymce.Formatter(this);

			// Register default formats
			t.formatter.register({
				alignleft : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'left'}},
					{selector : 'img,table', collapsed : false, styles : {'float' : 'left'}}
				],

				aligncenter : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'center'}},
					{selector : 'img', collapsed : false, styles : {display : 'block', marginLeft : 'auto', marginRight : 'auto'}},
					{selector : 'table', collapsed : false, styles : {marginLeft : 'auto', marginRight : 'auto'}}
				],

				alignright : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'right'}},
					{selector : 'img,table', collapsed : false, styles : {'float' : 'right'}}
				],

				alignfull : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'justify'}}
				],

				bold : [
					{inline : 'strong', remove : 'all'},
					{inline : 'span', styles : {fontWeight : 'bold'}},
					{inline : 'b', remove : 'all'}
				],

				italic : [
					{inline : 'em', remove : 'all'},
					{inline : 'span', styles : {fontStyle : 'italic'}},
					{inline : 'i', remove : 'all'}
				],

				underline : [
					{inline : 'span', styles : {textDecoration : 'underline'}, exact : true},
					{inline : 'u', remove : 'all'}
				],

				strikethrough : [
					{inline : 'span', styles : {textDecoration : 'line-through'}, exact : true},
					{inline : 'strike', remove : 'all'}
				],

				forecolor : {inline : 'span', styles : {color : '%value'}, wrap_links : false},
				hilitecolor : {inline : 'span', styles : {backgroundColor : '%value'}, wrap_links : false},
				fontname : {inline : 'span', styles : {fontFamily : '%value'}},
				fontsize : {inline : 'span', styles : {fontSize : '%value'}},
				fontsize_class : {inline : 'span', attributes : {'class' : '%value'}},
				blockquote : {block : 'blockquote', wrapper : 1, remove : 'all'},
				subscript : {inline : 'sub'},
				superscript : {inline : 'sup'},

				link : {inline : 'a', selector : 'a', remove : 'all', split : true, deep : true,
					onmatch : function(node) {
						return true;
					},

					onformat : function(elm, fmt, vars) {
						each(vars, function(value, key) {
							t.dom.setAttrib(elm, key, value);
						});
					}
				},

				removeformat : [
					{selector : 'b,strong,em,i,font,u,strike', remove : 'all', split : true, expand : false, block_expand : true, deep : true},
					{selector : 'span', attributes : ['style', 'class'], remove : 'empty', split : true, expand : false, deep : true},
					{selector : '*', attributes : ['style', 'class'], split : false, expand : false, deep : true}
				]
			});

			// Register default block formats
			each('p h1 h2 h3 h4 h5 h6 div address pre div code dt dd samp'.split(/\s/), function(name) {
				t.formatter.register(name, {block : name, remove : 'all'});
			});

			// Register user defined formats
			t.formatter.register(t.settings.formats);

			/**
			 * Undo manager instance, responsible for handling undo levels. 
			 *
			 * @property undoManager
			 * @type tinymce.UndoManager
			 * @example
			 * // Undoes the last modification to the editor
			 * tinyMCE.activeEditor.undoManager.undo();
			 */
			t.undoManager = new tinymce.UndoManager(t);

			// Pass through
			t.undoManager.onAdd.add(function(um, l) {
				if (um.hasUndo())
					return t.onChange.dispatch(t, l, um);
			});

			t.undoManager.onUndo.add(function(um, l) {
				return t.onUndo.dispatch(t, l, um);
			});

			t.undoManager.onRedo.add(function(um, l) {
				return t.onRedo.dispatch(t, l, um);
			});

			t.forceBlocks = new tinymce.ForceBlocks(t, {
				forced_root_block : s.forced_root_block
			});

			t.editorCommands = new tinymce.EditorCommands(t);

			// Pass through
			t.serializer.onPreProcess.add(function(se, o) {
				return t.onPreProcess.dispatch(t, o, se);
			});

			t.serializer.onPostProcess.add(function(se, o) {
				return t.onPostProcess.dispatch(t, o, se);
			});

			t.onPreInit.dispatch(t);

			if (!s.gecko_spellcheck)
				t.getBody().spellcheck = 0;

			if (!s.readonly)
				t._addEvents();

			t.controlManager.onPostRender.dispatch(t, t.controlManager);
			t.onPostRender.dispatch(t);

			t.quirks = new tinymce.util.Quirks(this);

			if (s.directionality)
				t.getBody().dir = s.directionality;

			if (s.nowrap)
				t.getBody().style.whiteSpace = "nowrap";

			if (s.handle_node_change_callback) {
				t.onNodeChange.add(function(ed, cm, n) {
					t.execCallback('handle_node_change_callback', t.id, n, -1, -1, true, t.selection.isCollapsed());
				});
			}

			if (s.save_callback) {
				t.onSaveContent.add(function(ed, o) {
					var h = t.execCallback('save_callback', t.id, o.content, t.getBody());

					if (h)
						o.content = h;
				});
			}

			if (s.onchange_callback) {
				t.onChange.add(function(ed, l) {
					t.execCallback('onchange_callback', t, l);
				});
			}

			if (s.protect) {
				t.onBeforeSetContent.add(function(ed, o) {
					if (s.protect) {
						each(s.protect, function(pattern) {
							o.content = o.content.replace(pattern, function(str) {
								return '<!--mce:protected ' + escape(str) + '-->';
							});
						});
					}
				});
			}

			if (s.convert_newlines_to_brs) {
				t.onBeforeSetContent.add(function(ed, o) {
					if (o.initial)
						o.content = o.content.replace(/\r?\n/g, '<br />');
				});
			}

			if (s.preformatted) {
				t.onPostProcess.add(function(ed, o) {
					o.content = o.content.replace(/^\s*<pre.*?>/, '');
					o.content = o.content.replace(/<\/pre>\s*$/, '');

					if (o.set)
						o.content = '<pre class="mceItemHidden">' + o.content + '</pre>';
				});
			}

			if (s.verify_css_classes) {
				t.serializer.attribValueFilter = function(n, v) {
					var s, cl;

					if (n == 'class') {
						// Build regexp for classes
						if (!t.classesRE) {
							cl = t.dom.getClasses();

							if (cl.length > 0) {
								s = '';

								each (cl, function(o) {
									s += (s ? '|' : '') + o['class'];
								});

								t.classesRE = new RegExp('(' + s + ')', 'gi');
							}
						}

						return !t.classesRE || /(\bmceItem\w+\b|\bmceTemp\w+\b)/g.test(v) || t.classesRE.test(v) ? v : '';
					}

					return v;
				};
			}

			if (s.cleanup_callback) {
				t.onBeforeSetContent.add(function(ed, o) {
					o.content = t.execCallback('cleanup_callback', 'insert_to_editor', o.content, o);
				});

				t.onPreProcess.add(function(ed, o) {
					if (o.set)
						t.execCallback('cleanup_callback', 'insert_to_editor_dom', o.node, o);

					if (o.get)
						t.execCallback('cleanup_callback', 'get_from_editor_dom', o.node, o);
				});

				t.onPostProcess.add(function(ed, o) {
					if (o.set)
						o.content = t.execCallback('cleanup_callback', 'insert_to_editor', o.content, o);

					if (o.get)						
						o.content = t.execCallback('cleanup_callback', 'get_from_editor', o.content, o);
				});
			}

			if (s.save_callback) {
				t.onGetContent.add(function(ed, o) {
					if (o.save)
						o.content = t.execCallback('save_callback', t.id, o.content, t.getBody());
				});
			}

			if (s.handle_event_callback) {
				t.onEvent.add(function(ed, e, o) {
					if (t.execCallback('handle_event_callback', e, ed, o) === false)
						Event.cancel(e);
				});
			}

			// Add visual aids when new contents is added
			t.onSetContent.add(function() {
				t.addVisual(t.getBody());
			});

			// Remove empty contents
			if (s.padd_empty_editor) {
				t.onPostProcess.add(function(ed, o) {
					o.content = o.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/, '');
				});
			}

			if (isGecko) {
				// Fix gecko link bug, when a link is placed at the end of block elements there is
				// no way to move the caret behind the link. This fix adds a bogus br element after the link
				function fixLinks(ed, o) {
					each(ed.dom.select('a'), function(n) {
						var pn = n.parentNode;

						if (ed.dom.isBlock(pn) && pn.lastChild === n)
							ed.dom.add(pn, 'br', {'data-mce-bogus' : 1});
					});
				};

				t.onExecCommand.add(function(ed, cmd) {
					if (cmd === 'CreateLink')
						fixLinks(ed);
				});

				t.onSetContent.add(t.selection.onSetContent.add(fixLinks));
			}

			t.load({initial : true, format : 'html'});
			t.startContent = t.getContent({format : 'raw'});
			t.undoManager.add();
			t.initialized = true;

			t.onInit.dispatch(t);
			t.execCallback('setupcontent_callback', t.id, t.getBody(), t.getDoc());
			t.execCallback('init_instance_callback', t);
			t.focus(true);
			t.nodeChanged({initial : 1});

			// Load specified content CSS last
			each(t.contentCSS, function(u) {
				t.dom.loadCSS(u);
			});

			// Handle auto focus
			if (s.auto_focus) {
				setTimeout(function () {
					var ed = tinymce.get(s.auto_focus);

					ed.selection.select(ed.getBody(), 1);
					ed.selection.collapse(1);
					ed.getBody().focus();
					ed.getWin().focus();
				}, 100);
			}

			e = null;
		},

		// #ifdef contentEditable

		/**
		 * Sets up the contentEditable mode.
		 *
		 * @method setupContentEditable
		 */
		setupContentEditable : function() {
			var t = this, s = t.settings, e = t.getElement();

			t.contentDocument = s.content_document || document;
			t.contentWindow = s.content_window || window;
			t.bodyElement = e;

			// Prevent leak in IE
			s.content_document = s.content_window = null;

			DOM.hide(e);
			e.contentEditable = t.getParam('content_editable_state', true);
			DOM.show(e);

			if (!s.gecko_spellcheck)
				t.getDoc().body.spellcheck = 0;

			// Setup objects
			t.dom = new tinymce.dom.DOMUtils(t.getDoc(), {
				keep_values : true,
				url_converter : t.convertURL,
				url_converter_scope : t,
				hex_colors : s.force_hex_style_colors,
				class_filter : s.class_filter,
				root_element : t.id,
				fix_ie_paragraphs : 1,
				update_styles : 1
			});

			t.serializer = new tinymce.dom.Serializer(s, t.dom, schema);

			t.selection = new tinymce.dom.Selection(t.dom, t.getWin(), t.serializer);
			t.forceBlocks = new tinymce.ForceBlocks(t, {
				forced_root_block : s.forced_root_block
			});

			t.editorCommands = new tinymce.EditorCommands(t);

			// Pass through
			t.serializer.onPreProcess.add(function(se, o) {
				return t.onPreProcess.dispatch(t, o, se);
			});

			t.serializer.onPostProcess.add(function(se, o) {
				return t.onPostProcess.dispatch(t, o, se);
			});

			t.onPreInit.dispatch(t);
			t._addEvents();

			t.controlManager.onPostRender.dispatch(t, t.controlManager);
			t.onPostRender.dispatch(t);

			t.onSetContent.add(function() {
				t.addVisual(t.getBody());
			});

			//t.load({initial : true, format : (s.cleanup_on_startup ? 'html' : 'raw')});
			t.startContent = t.getContent({format : 'raw'});
			t.undoManager.add({initial : true});
			t.initialized = true;

			t.onInit.dispatch(t);
			t.focus(true);
			t.nodeChanged({initial : 1});

			// Load specified content CSS last
			if (s.content_css) {
				each(explode(s.content_css), function(u) {
					t.dom.loadCSS(t.documentBaseURI.toAbsolute(u));
				});
			}

			if (isIE) {
				// Store away selection
				t.dom.bind(t.getElement(), 'beforedeactivate', function() {
					t.lastSelectionBookmark = t.selection.getBookmark(1);
				});

				t.onBeforeExecCommand.add(function(ed, cmd, ui, val, o) {
					if (!DOM.getParent(ed.selection.getStart(), function(n) {return n == ed.getBody();}))
						o.terminate = 1;

					if (!DOM.getParent(ed.selection.getEnd(), function(n) {return n == ed.getBody();}))
						o.terminate = 1;
				});
			}

			e = null; // Cleanup
		},

		// #endif

		/**
		 * Focuses/activates the editor. This will set this editor as the activeEditor in the tinymce collection
		 * it will also place DOM focus inside the editor.
		 *
		 * @method focus
		 * @param {Boolean} sf Skip DOM focus. Just set is as the active editor.
		 */
		focus : function(sf) {
			var oed, t = this, selection = t.selection, ce = t.settings.content_editable, ieRng, controlElm, doc = t.getDoc();

			if (!sf) {
				// Get selected control element
				ieRng = selection.getRng();
				if (ieRng.item) {
					controlElm = ieRng.item(0);
				}

				t._refreshContentEditable();

				// Is not content editable
				if (!ce)
					t.getWin().focus();

				// Focus the body as well since it's contentEditable
				if (tinymce.isGecko) {
					t.getBody().focus();
				}

				// Restore selected control element
				// This is needed when for example an image is selected within a
				// layer a call to focus will then remove the control selection
				if (controlElm && controlElm.ownerDocument == doc) {
					ieRng = doc.body.createControlRange();
					ieRng.addElement(controlElm);
					ieRng.select();
				}

				// #ifdef contentEditable

				// Content editable mode ends here
				if (ce) {
					if (tinymce.isWebKit)
						t.getWin().focus();
					else {
						if (tinymce.isIE)
							t.getElement().setActive();
						else
							t.getElement().focus();
					}
				}

				// #endif
			}

			if (tinymce.activeEditor != t) {
				if ((oed = tinymce.activeEditor) != null)
					oed.onDeactivate.dispatch(oed, t);

				t.onActivate.dispatch(t, oed);
			}

			tinymce._setActive(t);
		},

		/**
		 * Executes a legacy callback. This method is useful to call old 2.x option callbacks.
		 * There new event model is a better way to add callback so this method might be removed in the future.
		 *
		 * @method execCallback
		 * @param {String} n Name of the callback to execute.
		 * @return {Object} Return value passed from callback function.
		 */
		execCallback : function(n) {
			var t = this, f = t.settings[n], s;

			if (!f)
				return;

			// Look through lookup
			if (t.callbackLookup && (s = t.callbackLookup[n])) {
				f = s.func;
				s = s.scope;
			}

			if (is(f, 'string')) {
				s = f.replace(/\.\w+$/, '');
				s = s ? tinymce.resolve(s) : 0;
				f = tinymce.resolve(f);
				t.callbackLookup = t.callbackLookup || {};
				t.callbackLookup[n] = {func : f, scope : s};
			}

			return f.apply(s || t, Array.prototype.slice.call(arguments, 1));
		},

		/**
		 * Translates the specified string by replacing variables with language pack items it will also check if there is
		 * a key mathcin the input.
		 *
		 * @method translate
		 * @param {String} s String to translate by the language pack data.
		 * @return {String} Translated string.
		 */
		translate : function(s) {
			var c = this.settings.language || 'en', i18n = tinymce.i18n;

			if (!s)
				return '';

			return i18n[c + '.' + s] || s.replace(/{\#([^}]+)\}/g, function(a, b) {
				return i18n[c + '.' + b] || '{#' + b + '}';
			});
		},

		/**
		 * Returns a language pack item by name/key.
		 *
		 * @method getLang
		 * @param {String} n Name/key to get from the language pack.
		 * @param {String} dv Optional default value to retrive.
		 */
		getLang : function(n, dv) {
			return tinymce.i18n[(this.settings.language || 'en') + '.' + n] || (is(dv) ? dv : '{#' + n + '}');
		},

		/**
		 * Returns a configuration parameter by name.
		 *
		 * @method getParam
		 * @param {String} n Configruation parameter to retrive.
		 * @param {String} dv Optional default value to return.
		 * @param {String} ty Optional type parameter.
		 * @return {String} Configuration parameter value or default value.
		 * @example
		 * // Returns a specific config value from the currently active editor
		 * var someval = tinyMCE.activeEditor.getParam('myvalue');
		 * 
		 * // Returns a specific config value from a specific editor instance by id
		 * var someval2 = tinyMCE.get('my_editor').getParam('myvalue');
		 */
		getParam : function(n, dv, ty) {
			var tr = tinymce.trim, v = is(this.settings[n]) ? this.settings[n] : dv, o;

			if (ty === 'hash') {
				o = {};

				if (is(v, 'string')) {
					each(v.indexOf('=') > 0 ? v.split(/[;,](?![^=;,]*(?:[;,]|$))/) : v.split(','), function(v) {
						v = v.split('=');

						if (v.length > 1)
							o[tr(v[0])] = tr(v[1]);
						else
							o[tr(v[0])] = tr(v);
					});
				} else
					o = v;

				return o;
			}

			return v;
		},

		/**
		 * Distpaches out a onNodeChange event to all observers. This method should be called when you
		 * need to update the UI states or element path etc.
		 *
		 * @method nodeChanged
		 * @param {Object} o Optional object to pass along for the node changed event.
		 */
		nodeChanged : function(o) {
			var t = this, s = t.selection, n = s.getStart() || t.getBody();

			// Fix for bug #1896577 it seems that this can not be fired while the editor is loading
			if (t.initialized) {
				o = o || {};
				n = isIE && n.ownerDocument != t.getDoc() ? t.getBody() : n; // Fix for IE initial state

				// Get parents and add them to object
				o.parents = [];
				t.dom.getParent(n, function(node) {
					if (node.nodeName == 'BODY')
						return true;

					o.parents.push(node);
				});

				t.onNodeChange.dispatch(
					t,
					o ? o.controlManager || t.controlManager : t.controlManager,
					n,
					s.isCollapsed(),
					o
				);
			}
		},

		/**
		 * Adds a button that later gets created by the ControlManager. This is a shorter and easier method
		 * of adding buttons without the need to deal with the ControlManager directly. But it's also less
		 * powerfull if you need more control use the ControlManagers factory methods instead.
		 *
		 * @method addButton
		 * @param {String} n Button name to add.
		 * @param {Object} s Settings object with title, cmd etc.
		 * @example
		 * // Adds a custom button to the editor and when a user clicks the button it will open
		 * // an alert box with the selected contents as plain text.
		 * tinyMCE.init({
		 *    ...
		 * 
		 *    theme_advanced_buttons1 : 'example,..'
		 * 
		 *    setup : function(ed) {
		 *       // Register example button
		 *       ed.addButton('example', {
		 *          title : 'example.desc',
		 *          image : '../jscripts/tiny_mce/plugins/example/img/example.gif',
		 *          onclick : function() {
		 *             ed.windowManager.alert('Hello world!! Selection: ' + ed.selection.getContent({format : 'text'}));
		 *          }
		 *       });
		 *    }
		 * });
		 */
		addButton : function(n, s) {
			var t = this;

			t.buttons = t.buttons || {};
			t.buttons[n] = s;
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
		 * tinyMCE.init({
		 *    ...
		 * 
		 *    setup : function(ed) {
		 *       // Register example command
		 *       ed.addCommand('mycommand', function(ui, v) {
		 *          ed.windowManager.alert('Hello world!! Selection: ' + ed.selection.getContent({format : 'text'}));
		 *       });
		 *    }
		 * });
		 */
		addCommand : function(name, callback, scope) {
			/**
			 * Callback function that gets called when a command is executed.
			 *
			 * @callback addCommandCallback
			 * @param {Boolean} ui Display UI state true/false.
			 * @param {Object} value Optional value for command.
			 * @return {Boolean} True/false state if the command was handled or not.
			 */
			this.execCommands[name] = {func : callback, scope : scope || this};
		},

		/**
		 * Adds a custom query state command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with queryCommandState function.
		 *
		 * @method addQueryStateHandler
		 * @param {String} name Command name to add/override.
		 * @param {addQueryStateHandlerCallback} callback Function to execute when the command state retrival occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 */
		addQueryStateHandler : function(name, callback, scope) {
			/**
			 * Callback function that gets called when a queryCommandState is executed.
			 *
			 * @callback addQueryStateHandlerCallback
			 * @return {Boolean} True/false state if the command is enabled or not like is it bold.
			 */
			this.queryStateCommands[name] = {func : callback, scope : scope || this};
		},

		/**
		 * Adds a custom query value command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with queryCommandValue function.
		 *
		 * @method addQueryValueHandler
		 * @param {String} name Command name to add/override.
		 * @param {addQueryValueHandlerCallback} callback Function to execute when the command value retrival occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 */
		addQueryValueHandler : function(name, callback, scope) {
			/**
			 * Callback function that gets called when a queryCommandValue is executed.
			 *
			 * @callback addQueryValueHandlerCallback
			 * @return {Object} Value of the command or undefined.
			 */
			this.queryValueCommands[name] = {func : callback, scope : scope || this};
		},

		/**
		 * Adds a keyboard shortcut for some command or function.
		 *
		 * @method addShortcut
		 * @param {String} pa Shortcut pattern. Like for example: ctrl+alt+o.
		 * @param {String} desc Text description for the command.
		 * @param {String/Function} cmd_func Command name string or function to execute when the key is pressed.
		 * @param {Object} sc Optional scope to execute the function in.
		 * @return {Boolean} true/false state if the shortcut was added or not.
		 */
		addShortcut : function(pa, desc, cmd_func, sc) {
			var t = this, c;

			if (!t.settings.custom_shortcuts)
				return false;

			t.shortcuts = t.shortcuts || {};

			if (is(cmd_func, 'string')) {
				c = cmd_func;

				cmd_func = function() {
					t.execCommand(c, false, null);
				};
			}

			if (is(cmd_func, 'object')) {
				c = cmd_func;

				cmd_func = function() {
					t.execCommand(c[0], c[1], c[2]);
				};
			}

			each(explode(pa), function(pa) {
				var o = {
					func : cmd_func,
					scope : sc || this,
					desc : desc,
					alt : false,
					ctrl : false,
					shift : false
				};

				each(explode(pa, '+'), function(v) {
					switch (v) {
						case 'alt':
						case 'ctrl':
						case 'shift':
							o[v] = true;
							break;

						default:
							o.charCode = v.charCodeAt(0);
							o.keyCode = v.toUpperCase().charCodeAt(0);
					}
				});

				t.shortcuts[(o.ctrl ? 'ctrl' : '') + ',' + (o.alt ? 'alt' : '') + ',' + (o.shift ? 'shift' : '') + ',' + o.keyCode] = o;
			});

			return true;
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
		 * @param {mixed} val Optional command value, this can be anything.
		 * @param {Object} a Optional arguments object.
		 * @return {Boolean} True/false if the command was executed or not.
		 */
		execCommand : function(cmd, ui, val, a) {
			var t = this, s = 0, o, st;

			if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint|SelectAll)$/.test(cmd) && (!a || !a.skip_focus))
				t.focus();

			o = {};
			t.onBeforeExecCommand.dispatch(t, cmd, ui, val, o);
			if (o.terminate)
				return false;

			// Command callback
			if (t.execCallback('execcommand_callback', t.id, t.selection.getNode(), cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Registred commands
			if (o = t.execCommands[cmd]) {
				st = o.func.call(o.scope, ui, val);

				// Fall through on true
				if (st !== true) {
					t.onExecCommand.dispatch(t, cmd, ui, val, a);
					return st;
				}
			}

			// Plugin commands
			each(t.plugins, function(p) {
				if (p.execCommand && p.execCommand(cmd, ui, val)) {
					t.onExecCommand.dispatch(t, cmd, ui, val, a);
					s = 1;
					return false;
				}
			});

			if (s)
				return true;

			// Theme commands
			if (t.theme && t.theme.execCommand && t.theme.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Editor commands
			if (t.editorCommands.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Browser commands
			t.getDoc().execCommand(cmd, ui, val);
			t.onExecCommand.dispatch(t, cmd, ui, val, a);
		},

		/**
		 * Returns a command specific state, for example if bold is enabled or not.
		 *
		 * @method queryCommandState
		 * @param {string} cmd Command to query state from.
		 * @return {Boolean} Command specific state, for example if bold is enabled or not.
		 */
		queryCommandState : function(cmd) {
			var t = this, o, s;

			// Is hidden then return undefined
			if (t._isHidden())
				return;

			// Registred commands
			if (o = t.queryStateCommands[cmd]) {
				s = o.func.call(o.scope);

				// Fall though on true
				if (s !== true)
					return s;
			}

			// Registred commands
			o = t.editorCommands.queryCommandState(cmd);
			if (o !== -1)
				return o;

			// Browser commands
			try {
				return this.getDoc().queryCommandState(cmd);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		/**
		 * Returns a command specific value, for example the current font size.
		 *
		 * @method queryCommandValue
		 * @param {string} c Command to query value from.
		 * @return {Object} Command specific value, for example the current font size.
		 */
		queryCommandValue : function(c) {
			var t = this, o, s;

			// Is hidden then return undefined
			if (t._isHidden())
				return;

			// Registred commands
			if (o = t.queryValueCommands[c]) {
				s = o.func.call(o.scope);

				// Fall though on true
				if (s !== true)
					return s;
			}

			// Registred commands
			o = t.editorCommands.queryCommandValue(c);
			if (is(o))
				return o;

			// Browser commands
			try {
				return this.getDoc().queryCommandValue(c);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		/**
		 * Shows the editor and hides any textarea/div that the editor is supposed to replace.
		 *
		 * @method show
		 */
		show : function() {
			var t = this;

			DOM.show(t.getContainer());
			DOM.hide(t.id);
			t.load();
		},

		/**
		 * Hides the editor and shows any textarea/div that the editor is supposed to replace.
		 *
		 * @method hide
		 */
		hide : function() {
			var t = this, d = t.getDoc();

			// Fixed bug where IE has a blinking cursor left from the editor
			if (isIE && d)
				d.execCommand('SelectAll');

			// We must save before we hide so Safari doesn't crash
			t.save();
			DOM.hide(t.getContainer());
			DOM.setStyle(t.id, 'display', t.orgDisplay);
		},

		/**
		 * Returns true/false if the editor is hidden or not.
		 *
		 * @method isHidden
		 * @return {Boolean} True/false if the editor is hidden or not.
		 */
		isHidden : function() {
			return !DOM.isHidden(this.id);
		},

		/**
		 * Sets the progress state, this will display a throbber/progess for the editor.
		 * This is ideal for asycronous operations like an AJAX save call.
		 *
		 * @method setProgressState
		 * @param {Boolean} b Boolean state if the progress should be shown or hidden.
		 * @param {Number} ti Optional time to wait before the progress gets shown.
		 * @param {Object} o Optional object to pass to the progress observers.
		 * @return {Boolean} Same as the input state.
		 * @example
		 * // Show progress for the active editor
		 * tinyMCE.activeEditor.setProgressState(true);
		 * 
		 * // Hide progress for the active editor
		 * tinyMCE.activeEditor.setProgressState(false);
		 * 
		 * // Show progress after 3 seconds
		 * tinyMCE.activeEditor.setProgressState(true, 3000);
		 */
		setProgressState : function(b, ti, o) {
			this.onSetProgressState.dispatch(this, b, ti, o);

			return b;
		},

		/**
		 * Loads contents from the textarea or div element that got converted into an editor instance.
		 * This method will move the contents from that textarea or div into the editor by using setContent
		 * so all events etc that method has will get dispatched as well.
		 *
		 * @method load
		 * @param {Object} o Optional content object, this gets passed around through the whole load process.
		 * @return {String} HTML string that got set into the editor.
		 */
		load : function(o) {
			var t = this, e = t.getElement(), h;

			if (e) {
				o = o || {};
				o.load = true;

				// Double encode existing entities in the value
				h = t.setContent(is(e.value) ? e.value : e.innerHTML, o);
				o.element = e;

				if (!o.no_events)
					t.onLoadContent.dispatch(t, o);

				o.element = e = null;

				return h;
			}
		},

		/**
		 * Saves the contents from a editor out to the textarea or div element that got converted into an editor instance.
		 * This method will move the HTML contents from the editor into that textarea or div by getContent
		 * so all events etc that method has will get dispatched as well.
		 *
		 * @method save
		 * @param {Object} o Optional content object, this gets passed around through the whole save process.
		 * @return {String} HTML string that got set into the textarea/div.
		 */
		save : function(o) {
			var t = this, e = t.getElement(), h, f;

			if (!e || !t.initialized)
				return;

			o = o || {};
			o.save = true;

			// Add undo level will trigger onchange event
			if (!o.no_events) {
				t.undoManager.typing = false;
				t.undoManager.add();
			}

			o.element = e;
			h = o.content = t.getContent(o);

			if (!o.no_events)
				t.onSaveContent.dispatch(t, o);

			h = o.content;

			if (!/TEXTAREA|INPUT/i.test(e.nodeName)) {
				e.innerHTML = h;

				// Update hidden form element
				if (f = DOM.getParent(t.id, 'form')) {
					each(f.elements, function(e) {
						if (e.name == t.id) {
							e.value = h;
							return false;
						}
					});
				}
			} else
				e.value = h;

			o.element = e = null;

			return h;
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
		 * tinyMCE.activeEditor.setContent('<span>some</span> html');
		 * 
		 * // Sets the raw contents of the activeEditor editor
		 * tinyMCE.activeEditor.setContent('<span>some</span> html', {format : 'raw'});
		 * 
		 * // Sets the content of a specific editor (my_editor in this example)
		 * tinyMCE.get('my_editor').setContent(data);
		 * 
		 * // Sets the bbcode contents of the activeEditor editor if the bbcode plugin was added
		 * tinyMCE.activeEditor.setContent('[b]some[/b] html', {format : 'bbcode'});
		 */
		setContent : function(content, args) {
			var self = this, rootNode, body = self.getBody(), forcedRootBlockName;

			// Setup args object
			args = args || {};
			args.format = args.format || 'html';
			args.set = true;
			args.content = content;

			// Do preprocessing
			if (!args.no_events)
				self.onBeforeSetContent.dispatch(self, args);

			content = args.content;

			// Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
			// It will also be impossible to place the caret in the editor unless there is a BR element present
			if (!tinymce.isIE && (content.length === 0 || /^\s+$/.test(content))) {
				forcedRootBlockName = self.settings.forced_root_block;
				if (forcedRootBlockName)
					content = '<' + forcedRootBlockName + '><br data-mce-bogus="1"></' + forcedRootBlockName + '>';
				else
					content = '<br data-mce-bogus="1">';

				body.innerHTML = content;
				self.selection.select(body, true);
				self.selection.collapse(true);
				return;
			}

			// Parse and serialize the html
			if (args.format !== 'raw') {
				content = new tinymce.html.Serializer({}, self.schema).serialize(
					self.parser.parse(content)
				);
			}

			// Set the new cleaned contents to the editor
			args.content = tinymce.trim(content);
			self.dom.setHTML(body, args.content);

			// Do post processing
			if (!args.no_events)
				self.onSetContent.dispatch(self, args);

			self.selection.normalize();

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
		 * console.debug(tinyMCE.activeEditor.getContent());
		 * 
		 * // Get the raw contents of the currently active editor
		 * tinyMCE.activeEditor.getContent({format : 'raw'});
		 * 
		 * // Get content of a specific editor:
		 * tinyMCE.get('content id').getContent()
		 */
		getContent : function(args) {
			var self = this, content;

			// Setup args object
			args = args || {};
			args.format = args.format || 'html';
			args.get = true;

			// Do preprocessing
			if (!args.no_events)
				self.onBeforeGetContent.dispatch(self, args);

			// Get raw contents or by default the cleaned contents
			if (args.format == 'raw')
				content = self.getBody().innerHTML;
			else
				content = self.serializer.serialize(self.getBody(), args);

			args.content = tinymce.trim(content);

			// Do post processing
			if (!args.no_events)
				self.onGetContent.dispatch(self, args);

			return args.content;
		},

		/**
		 * Returns true/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
		 *
		 * @method isDirty
		 * @return {Boolean} True/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
		 * @example
		 * if (tinyMCE.activeEditor.isDirty())
		 *     alert("You must save your contents.");
		 */
		isDirty : function() {
			var self = this;

			return tinymce.trim(self.startContent) != tinymce.trim(self.getContent({format : 'raw', no_events : 1})) && !self.isNotDirty;
		},

		/**
		 * Returns the editors container element. The container element wrappes in
		 * all the elements added to the page for the editor. Such as UI, iframe etc.
		 *
		 * @method getContainer
		 * @return {Element} HTML DOM element for the editor container.
		 */
		getContainer : function() {
			var t = this;

			if (!t.container)
				t.container = DOM.get(t.editorContainer || t.id + '_parent');

			return t.container;
		},

		/**
		 * Returns the editors content area container element. The this element is the one who
		 * holds the iframe or the editable element.
		 *
		 * @method getContentAreaContainer
		 * @return {Element} HTML DOM element for the editor area container.
		 */
		getContentAreaContainer : function() {
			return this.contentAreaContainer;
		},

		/**
		 * Returns the target element/textarea that got replaced with a TinyMCE editor instance.
		 *
		 * @method getElement
		 * @return {Element} HTML DOM element for the replaced element.
		 */
		getElement : function() {
			return DOM.get(this.settings.content_element || this.id);
		},

		/**
		 * Returns the iframes window object.
		 *
		 * @method getWin
		 * @return {Window} Iframe DOM window object.
		 */
		getWin : function() {
			var t = this, e;

			if (!t.contentWindow) {
				e = DOM.get(t.id + "_ifr");

				if (e)
					t.contentWindow = e.contentWindow;
			}

			return t.contentWindow;
		},

		/**
		 * Returns the iframes document object.
		 *
		 * @method getDoc
		 * @return {Document} Iframe DOM document object.
		 */
		getDoc : function() {
			var t = this, w;

			if (!t.contentDocument) {
				w = t.getWin();

				if (w)
					t.contentDocument = w.document;
			}

			return t.contentDocument;
		},

		/**
		 * Returns the iframes body element.
		 *
		 * @method getBody
		 * @return {Element} Iframe body element.
		 */
		getBody : function() {
			return this.bodyElement || this.getDoc().body;
		},

		/**
		 * URL converter function this gets executed each time a user adds an img, a or
		 * any other element that has a URL in it. This will be called both by the DOM and HTML
		 * manipulation functions.
		 *
		 * @method convertURL
		 * @param {string} u URL to convert.
		 * @param {string} n Attribute name src, href etc.
		 * @param {string/HTMLElement} Tag name or HTML DOM element depending on HTML or DOM insert.
		 * @return {string} Converted URL string.
		 */
		convertURL : function(u, n, e) {
			var t = this, s = t.settings;

			// Use callback instead
			if (s.urlconverter_callback)
				return t.execCallback('urlconverter_callback', u, e, true, n);

			// Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
			if (!s.convert_urls || (e && e.nodeName == 'LINK') || u.indexOf('file:') === 0)
				return u;

			// Convert to relative
			if (s.relative_urls)
				return t.documentBaseURI.toRelative(u);

			// Convert to absolute
			u = t.documentBaseURI.toAbsolute(u, s.remove_script_host);

			return u;
		},

		/**
		 * Adds visual aid for tables, anchors etc so they can be more easily edited inside the editor.
		 *
		 * @method addVisual
		 * @param {Element} e Optional root element to loop though to find tables etc that needs the visual aid.
		 */
		addVisual : function(e) {
			var t = this, s = t.settings;

			e = e || t.getBody();

			if (!is(t.hasVisual))
				t.hasVisual = s.visual;

			each(t.dom.select('table,a', e), function(e) {
				var v;

				switch (e.nodeName) {
					case 'TABLE':
						v = t.dom.getAttrib(e, 'border');

						if (!v || v == '0') {
							if (t.hasVisual)
								t.dom.addClass(e, s.visual_table_class);
							else
								t.dom.removeClass(e, s.visual_table_class);
						}

						return;

					case 'A':
						v = t.dom.getAttrib(e, 'name');

						if (v) {
							if (t.hasVisual)
								t.dom.addClass(e, 'mceItemAnchor');
							else
								t.dom.removeClass(e, 'mceItemAnchor');
						}

						return;
				}
			});

			t.onVisualAid.dispatch(t, e, t.hasVisual);
		},

		/**
		 * Removes the editor from the dom and tinymce collection.
		 *
		 * @method remove
		 */
		remove : function() {
			var t = this, e = t.getContainer();

			t.removed = 1; // Cancels post remove event execution
			t.hide();

			t.execCallback('remove_instance_callback', t);
			t.onRemove.dispatch(t);

			// Clear all execCommand listeners this is required to avoid errors if the editor was removed inside another command
			t.onExecCommand.listeners = [];

			tinymce.remove(t);
			DOM.remove(e);
		},

		/**
		 * Destroys the editor instance by removing all events, element references or other resources
		 * that could leak memory. This method will be called automatically when the page is unloaded
		 * but you can also call it directly if you know what you are doing.
		 *
		 * @method destroy
		 * @param {Boolean} s Optional state if the destroy is an automatic destroy or user called one.
		 */
		destroy : function(s) {
			var t = this;

			// One time is enough
			if (t.destroyed)
				return;

			if (!s) {
				tinymce.removeUnload(t.destroy);
				tinyMCE.onBeforeUnload.remove(t._beforeUnload);

				// Manual destroy
				if (t.theme && t.theme.destroy)
					t.theme.destroy();

				// Destroy controls, selection and dom
				t.controlManager.destroy();
				t.selection.destroy();
				t.dom.destroy();

				// Remove all events

				// Don't clear the window or document if content editable
				// is enabled since other instances might still be present
				if (!t.settings.content_editable) {
					Event.clear(t.getWin());
					Event.clear(t.getDoc());
				}

				Event.clear(t.getBody());
				Event.clear(t.formElement);
			}

			if (t.formElement) {
				t.formElement.submit = t.formElement._mceOldSubmit;
				t.formElement._mceOldSubmit = null;
			}

			t.contentAreaContainer = t.formElement = t.container = t.settings.content_element = t.bodyElement = t.contentDocument = t.contentWindow = null;

			if (t.selection)
				t.selection = t.selection.win = t.selection.dom = t.selection.dom.doc = null;

			t.destroyed = 1;
		},

		// Internal functions

		_addEvents : function() {
			// 'focus', 'blur', 'dblclick', 'beforedeactivate', submit, reset
			var t = this, i, s = t.settings, dom = t.dom, lo = {
				mouseup : 'onMouseUp',
				mousedown : 'onMouseDown',
				click : 'onClick',
				keyup : 'onKeyUp',
				keydown : 'onKeyDown',
				keypress : 'onKeyPress',
				submit : 'onSubmit',
				reset : 'onReset',
				contextmenu : 'onContextMenu',
				dblclick : 'onDblClick',
				paste : 'onPaste' // Doesn't work in all browsers yet
			};

			function eventHandler(e, o) {
				var ty = e.type;

				// Don't fire events when it's removed
				if (t.removed)
					return;

				// Generic event handler
				if (t.onEvent.dispatch(t, e, o) !== false) {
					// Specific event handler
					t[lo[e.fakeType || e.type]].dispatch(t, e, o);
				}
			};

			// Add DOM events
			each(lo, function(v, k) {
				switch (k) {
					case 'contextmenu':
						dom.bind(t.getDoc(), k, eventHandler);
						break;

					case 'paste':
						dom.bind(t.getBody(), k, function(e) {
							eventHandler(e);
						});
						break;

					case 'submit':
					case 'reset':
						dom.bind(t.getElement().form || DOM.getParent(t.id, 'form'), k, eventHandler);
						break;

					default:
						dom.bind(s.content_editable ? t.getBody() : t.getDoc(), k, eventHandler);
				}
			});

			dom.bind(s.content_editable ? t.getBody() : (isGecko ? t.getDoc() : t.getWin()), 'focus', function(e) {
				t.focus(true);
			});

			// #ifdef contentEditable

			if (s.content_editable && tinymce.isOpera) {
				// Opera doesn't support focus event for contentEditable elements so we need to fake it
				function doFocus(e) {
					t.focus(true);
				};

				dom.bind(t.getBody(), 'click', doFocus);
				dom.bind(t.getBody(), 'keydown', doFocus);
			}

			// #endif

			// Fixes bug where a specified document_base_uri could result in broken images
			// This will also fix drag drop of images in Gecko
			if (tinymce.isGecko) {
				dom.bind(t.getDoc(), 'DOMNodeInserted', function(e) {
					var v;

					e = e.target;

					if (e.nodeType === 1 && e.nodeName === 'IMG' && (v = e.getAttribute('data-mce-src')))
						e.src = t.documentBaseURI.toAbsolute(v);
				});
			}

			// Set various midas options in Gecko
			if (isGecko) {
				function setOpts() {
					var t = this, d = t.getDoc(), s = t.settings;

					if (isGecko && !s.readonly) {
						t._refreshContentEditable();

						try {
							// Try new Gecko method
							d.execCommand("styleWithCSS", 0, false);
						} catch (ex) {
							// Use old method
							if (!t._isHidden())
								try {d.execCommand("useCSS", 0, true);} catch (ex) {}
						}

						if (!s.table_inline_editing)
							try {d.execCommand('enableInlineTableEditing', false, false);} catch (ex) {}

						if (!s.object_resizing)
							try {d.execCommand('enableObjectResizing', false, false);} catch (ex) {}
					}
				};

				t.onBeforeExecCommand.add(setOpts);
				t.onMouseDown.add(setOpts);
			}

			// Add node change handlers
			t.onMouseUp.add(t.nodeChanged);
			//t.onClick.add(t.nodeChanged);
			t.onKeyUp.add(function(ed, e) {
				var c = e.keyCode;

				if ((c >= 33 && c <= 36) || (c >= 37 && c <= 40) || c == 13 || c == 45 || c == 46 || c == 8 || (tinymce.isMac && (c == 91 || c == 93)) || e.ctrlKey)
					t.nodeChanged();
			});


			// Add block quote deletion handler
			t.onKeyDown.add(function(ed, e) {
				if (e.keyCode != VK.BACKSPACE)
					return;

				var rng = ed.selection.getRng();
				if (!rng.collapsed)
					return;

				var n = rng.startContainer;
				var offset = rng.startOffset;

				while (n && n.nodeType && n.nodeType != 1 && n.parentNode)
					n = n.parentNode;
					
				// Is the cursor at the beginning of a blockquote?
				if (n && n.parentNode && n.parentNode.tagName === 'BLOCKQUOTE' && n.parentNode.firstChild == n && offset == 0) {
					// Remove the blockquote
					ed.formatter.toggle('blockquote', null, n.parentNode);

					// Move the caret to the beginning of n
					rng.setStart(n, 0);
					rng.setEnd(n, 0);
					ed.selection.setRng(rng);
					ed.selection.collapse(false);
				}
			});
 


			// Add reset handler
			t.onReset.add(function() {
				t.setContent(t.startContent, {format : 'raw'});
			});

			// Add shortcuts
			if (s.custom_shortcuts) {
				if (s.custom_undo_redo_keyboard_shortcuts) {
					t.addShortcut('ctrl+z', t.getLang('undo_desc'), 'Undo');
					t.addShortcut('ctrl+y', t.getLang('redo_desc'), 'Redo');
				}

				// Add default shortcuts for gecko
				t.addShortcut('ctrl+b', t.getLang('bold_desc'), 'Bold');
				t.addShortcut('ctrl+i', t.getLang('italic_desc'), 'Italic');
				t.addShortcut('ctrl+u', t.getLang('underline_desc'), 'Underline');

				// BlockFormat shortcuts keys
				for (i=1; i<=6; i++)
					t.addShortcut('ctrl+' + i, '', ['FormatBlock', false, 'h' + i]);

				t.addShortcut('ctrl+7', '', ['FormatBlock', false, 'p']);
				t.addShortcut('ctrl+8', '', ['FormatBlock', false, 'div']);
				t.addShortcut('ctrl+9', '', ['FormatBlock', false, 'address']);

				function find(e) {
					var v = null;

					if (!e.altKey && !e.ctrlKey && !e.metaKey)
						return v;

					each(t.shortcuts, function(o) {
						if (tinymce.isMac && o.ctrl != e.metaKey)
							return;
						else if (!tinymce.isMac && o.ctrl != e.ctrlKey)
							return;

						if (o.alt != e.altKey)
							return;

						if (o.shift != e.shiftKey)
							return;

						if (e.keyCode == o.keyCode || (e.charCode && e.charCode == o.charCode)) {
							v = o;
							return false;
						}
					});

					return v;
				};

				t.onKeyUp.add(function(ed, e) {
					var o = find(e);

					if (o)
						return Event.cancel(e);
				});

				t.onKeyPress.add(function(ed, e) {
					var o = find(e);

					if (o)
						return Event.cancel(e);
				});

				t.onKeyDown.add(function(ed, e) {
					var o = find(e);

					if (o) {
						o.func.call(o.scope);
						return Event.cancel(e);
					}
				});
			}

			if (tinymce.isIE) {
				// Fix so resize will only update the width and height attributes not the styles of an image
				// It will also block mceItemNoResize items
				dom.bind(t.getDoc(), 'controlselect', function(e) {
					var re = t.resizeInfo, cb;

					e = e.target;

					// Don't do this action for non image elements
					if (e.nodeName !== 'IMG')
						return;

					if (re)
						dom.unbind(re.node, re.ev, re.cb);

					if (!dom.hasClass(e, 'mceItemNoResize')) {
						ev = 'resizeend';
						cb = dom.bind(e, ev, function(e) {
							var v;

							e = e.target;

							if (v = dom.getStyle(e, 'width')) {
								dom.setAttrib(e, 'width', v.replace(/[^0-9%]+/g, ''));
								dom.setStyle(e, 'width', '');
							}

							if (v = dom.getStyle(e, 'height')) {
								dom.setAttrib(e, 'height', v.replace(/[^0-9%]+/g, ''));
								dom.setStyle(e, 'height', '');
							}
						});
					} else {
						ev = 'resizestart';
						cb = dom.bind(e, 'resizestart', Event.cancel, Event);
					}

					re = t.resizeInfo = {
						node : e,
						ev : ev,
						cb : cb
					};
				});
			}

			if (tinymce.isOpera) {
				t.onClick.add(function(ed, e) {
					Event.prevent(e);
				});
			}

			// Add custom undo/redo handlers
			if (s.custom_undo_redo) {
				function addUndo() {
					t.undoManager.typing = false;
					t.undoManager.add();
				};

				dom.bind(t.getDoc(), 'focusout', function(e) {
					if (!t.removed && t.undoManager.typing)
						addUndo();
				});

				// Add undo level when contents is drag/dropped within the editor
				t.dom.bind(t.dom.getRoot(), 'dragend', function(e) {
					addUndo();
				});

				t.onKeyUp.add(function(ed, e) {
					var keyCode = e.keyCode;

					if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 13 || keyCode == 45 || e.ctrlKey)
						addUndo();
				});

				t.onKeyDown.add(function(ed, e) {
					var keyCode = e.keyCode, sel;

					if (keyCode == 8) {
						sel = t.getDoc().selection;

						// Fix IE control + backspace browser bug
						if (sel && sel.createRange && sel.createRange().item) {
							t.undoManager.beforeChange();
							ed.dom.remove(sel.createRange().item(0));
							addUndo();

							return Event.cancel(e);
						}
					}

					// Is caracter positon keys left,right,up,down,home,end,pgdown,pgup,enter
					if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 13 || keyCode == 45) {
						// Add position before enter key is pressed, used by IE since it still uses the default browser behavior
						// Todo: Remove this once we normalize enter behavior on IE
						if (tinymce.isIE && keyCode == 13)
							t.undoManager.beforeChange();

						if (t.undoManager.typing)
							addUndo();

						return;
					}

					// If key isn't shift,ctrl,alt,capslock,metakey
					if ((keyCode < 16 || keyCode > 20) && keyCode != 224 && keyCode != 91 && !t.undoManager.typing) {
						t.undoManager.beforeChange();
						t.undoManager.typing = true;
						t.undoManager.add();
					}
				});

				t.onMouseDown.add(function() {
					if (t.undoManager.typing)
						addUndo();
				});
			}

			// Bug fix for FireFox keeping styles from end of selection instead of start.
			if (tinymce.isGecko) {
				function getAttributeApplyFunction() {
					var template = t.dom.getAttribs(t.selection.getStart().cloneNode(false));

					return function() {
						var target = t.selection.getStart();

						if (target !== t.getBody()) {
							t.dom.setAttrib(target, "style", null);

							each(template, function(attr) {
								target.setAttributeNode(attr.cloneNode(true));
							});
						}
					};
				}

				function isSelectionAcrossElements() {
					var s = t.selection;

					return !s.isCollapsed() && s.getStart() != s.getEnd();
				}

				t.onKeyPress.add(function(ed, e) {
					var applyAttributes;

					if ((e.keyCode == 8 || e.keyCode == 46) && isSelectionAcrossElements()) {
						applyAttributes = getAttributeApplyFunction();
						t.getDoc().execCommand('delete', false, null);
						applyAttributes();

						return Event.cancel(e);
					}
				});

				t.dom.bind(t.getDoc(), 'cut', function(e) {
					var applyAttributes;

					if (isSelectionAcrossElements()) {
						applyAttributes = getAttributeApplyFunction();
						t.onKeyUp.addToTop(Event.cancel, Event);

						setTimeout(function() {
							applyAttributes();
							t.onKeyUp.remove(Event.cancel, Event);
						}, 0);
					}
				});
			}
		},

		_refreshContentEditable : function() {
			var self = this, body, parent;

			// Check if the editor was hidden and the re-initalize contentEditable mode by removing and adding the body again
			if (self._isHidden()) {
				body = self.getBody();
				parent = body.parentNode;

				parent.removeChild(body);
				parent.appendChild(body);

				body.focus();
			}
		},

		_isHidden : function() {
			var s;

			if (!isGecko)
				return 0;

			// Weird, wheres that cursor selection?
			s = this.selection.getSel();
			return (!s || !s.rangeCount || s.rangeCount == 0);
		}
	});
})(tinymce);
