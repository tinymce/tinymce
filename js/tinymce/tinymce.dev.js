/**
 * Inline development version. Only to be used while developing since it uses document.write to load scripts.
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports) {
	"use strict";

	var html = "", baseDir;
	var modules = {}, exposedModules = [], moduleCount = 0;

	var scripts = document.getElementsByTagName('script');
	for (var i = 0; i < scripts.length; i++) {
		var src = scripts[i].src;

		if (src.indexOf('/tinymce.dev.js') != -1) {
			baseDir = src.substring(0, src.lastIndexOf('/'));
		}
	}

	function require(ids, callback) {
		var module, defs = [];

		for (var i = 0; i < ids.length; ++i) {
			module = modules[ids[i]] || resolve(ids[i]);
			if (!module) {
				throw 'module definition dependecy not found: ' + ids[i];
			}

			defs.push(module);
		}

		callback.apply(null, defs);
	}

	function resolve(id) {
		var target = exports;
		var fragments = id.split(/[.\/]/);

		for (var fi = 0; fi < fragments.length; ++fi) {
			if (!target[fragments[fi]]) {
				return;
			}

			target = target[fragments[fi]];
		}

		return target;
	}

	function register(id) {
		var target = exports;
		var fragments = id.split(/[.\/]/);

		for (var fi = 0; fi < fragments.length - 1; ++fi) {
			if (target[fragments[fi]] === undefined) {
				target[fragments[fi]] = {};
			}

			target = target[fragments[fi]];
		}

		target[fragments[fragments.length - 1]] = modules[id];
	}

	function define(id, dependencies, definition) {
		if (typeof id !== 'string') {
			throw 'invalid module definition, module id must be defined and be a string';
		}

		if (dependencies === undefined) {
			throw 'invalid module definition, dependencies must be specified';
		}

		if (definition === undefined) {
			throw 'invalid module definition, definition function must be specified';
		}

		require(dependencies, function() {
			modules[id] = definition.apply(null, arguments);
		});

		if (--moduleCount === 0) {
			for (var i = 0; i < exposedModules.length; i++) {
				register(exposedModules[i]);
			}
		}
	}

	function expose(ids) {
		exposedModules = ids;
	}

	function writeScripts() {
		document.write(html);
	}

	function load(path) {
		html += '<script type="text/javascript" src="' + baseDir + '/' + path + '"></script>\n';
		moduleCount++;
	}

	// Expose globally
	exports.define = define;
	exports.require = require;

	expose(["tinymce/dom/EventUtils","tinymce/dom/Sizzle","tinymce/dom/DomQuery","tinymce/html/Styles","tinymce/dom/TreeWalker","tinymce/util/Tools","tinymce/dom/Range","tinymce/html/Entities","tinymce/Env","tinymce/dom/StyleSheetLoader","tinymce/dom/DOMUtils","tinymce/dom/ScriptLoader","tinymce/AddOnManager","tinymce/html/Node","tinymce/html/Schema","tinymce/html/SaxParser","tinymce/html/DomParser","tinymce/html/Writer","tinymce/html/Serializer","tinymce/dom/Serializer","tinymce/dom/TridentSelection","tinymce/util/VK","tinymce/dom/ControlSelection","tinymce/dom/RangeUtils","tinymce/dom/Selection","tinymce/Formatter","tinymce/UndoManager","tinymce/EnterKey","tinymce/ForceBlocks","tinymce/EditorCommands","tinymce/util/URI","tinymce/util/Class","tinymce/ui/Selector","tinymce/ui/Collection","tinymce/ui/DomUtils","tinymce/ui/Control","tinymce/ui/Factory","tinymce/ui/Container","tinymce/ui/DragHelper","tinymce/ui/Scrollable","tinymce/ui/Panel","tinymce/ui/Movable","tinymce/ui/Resizable","tinymce/ui/FloatPanel","tinymce/ui/KeyboardNavigation","tinymce/ui/Window","tinymce/ui/MessageBox","tinymce/WindowManager","tinymce/util/Quirks","tinymce/util/Observable","tinymce/Shortcuts","tinymce/Editor","tinymce/util/I18n","tinymce/FocusManager","tinymce/EditorManager","tinymce/LegacyInput","tinymce/util/XHR","tinymce/util/JSON","tinymce/util/JSONRequest","tinymce/util/JSONP","tinymce/util/LocalStorage","tinymce/Compat","tinymce/ui/Layout","tinymce/ui/AbsoluteLayout","tinymce/ui/Tooltip","tinymce/ui/Widget","tinymce/ui/Button","tinymce/ui/ButtonGroup","tinymce/ui/Checkbox","tinymce/ui/PanelButton","tinymce/ui/ColorButton","tinymce/ui/ComboBox","tinymce/ui/Path","tinymce/ui/ElementPath","tinymce/ui/FormItem","tinymce/ui/Form","tinymce/ui/FieldSet","tinymce/ui/FilePicker","tinymce/ui/FitLayout","tinymce/ui/FlexLayout","tinymce/ui/FlowLayout","tinymce/ui/FormatControls","tinymce/ui/GridLayout","tinymce/ui/Iframe","tinymce/ui/Label","tinymce/ui/Toolbar","tinymce/ui/MenuBar","tinymce/ui/MenuButton","tinymce/ui/ListBox","tinymce/ui/MenuItem","tinymce/ui/Menu","tinymce/ui/Radio","tinymce/ui/ResizeHandle","tinymce/ui/Spacer","tinymce/ui/SplitButton","tinymce/ui/StackLayout","tinymce/ui/TabPanel","tinymce/ui/TextBox","tinymce/ui/Throbber"]);

	load('classes/dom/EventUtils.js');
	load('classes/dom/Sizzle.js');
	load('classes/dom/DomQuery.js');
	load('classes/html/Styles.js');
	load('classes/dom/TreeWalker.js');
	load('classes/util/Tools.js');
	load('classes/dom/Range.js');
	load('classes/html/Entities.js');
	load('classes/Env.js');
	load('classes/dom/StyleSheetLoader.js');
	load('classes/dom/DOMUtils.js');
	load('classes/dom/ScriptLoader.js');
	load('classes/AddOnManager.js');
	load('classes/html/Node.js');
	load('classes/html/Schema.js');
	load('classes/html/SaxParser.js');
	load('classes/html/DomParser.js');
	load('classes/html/Writer.js');
	load('classes/html/Serializer.js');
	load('classes/dom/Serializer.js');
	load('classes/dom/TridentSelection.js');
	load('classes/util/VK.js');
	load('classes/dom/ControlSelection.js');
	load('classes/dom/RangeUtils.js');
	load('classes/dom/Selection.js');
	load('classes/Formatter.js');
	load('classes/UndoManager.js');
	load('classes/EnterKey.js');
	load('classes/ForceBlocks.js');
	load('classes/EditorCommands.js');
	load('classes/util/URI.js');
	load('classes/util/Class.js');
	load('classes/ui/Selector.js');
	load('classes/ui/Collection.js');
	load('classes/ui/DomUtils.js');
	load('classes/ui/Control.js');
	load('classes/ui/Factory.js');
	load('classes/ui/Container.js');
	load('classes/ui/DragHelper.js');
	load('classes/ui/Scrollable.js');
	load('classes/ui/Panel.js');
	load('classes/ui/Movable.js');
	load('classes/ui/Resizable.js');
	load('classes/ui/FloatPanel.js');
	load('classes/ui/KeyboardNavigation.js');
	load('classes/ui/Window.js');
	load('classes/ui/MessageBox.js');
	load('classes/WindowManager.js');
	load('classes/util/Quirks.js');
	load('classes/util/Observable.js');
	load('classes/Shortcuts.js');
	load('classes/Editor.js');
	load('classes/util/I18n.js');
	load('classes/FocusManager.js');
	load('classes/EditorManager.js');
	load('classes/LegacyInput.js');
	load('classes/util/XHR.js');
	load('classes/util/JSON.js');
	load('classes/util/JSONRequest.js');
	load('classes/util/JSONP.js');
	load('classes/util/LocalStorage.js');
	load('classes/Compat.js');
	load('classes/ui/Layout.js');
	load('classes/ui/AbsoluteLayout.js');
	load('classes/ui/Tooltip.js');
	load('classes/ui/Widget.js');
	load('classes/ui/Button.js');
	load('classes/ui/ButtonGroup.js');
	load('classes/ui/Checkbox.js');
	load('classes/ui/PanelButton.js');
	load('classes/ui/ColorButton.js');
	load('classes/ui/ComboBox.js');
	load('classes/ui/Path.js');
	load('classes/ui/ElementPath.js');
	load('classes/ui/FormItem.js');
	load('classes/ui/Form.js');
	load('classes/ui/FieldSet.js');
	load('classes/ui/FilePicker.js');
	load('classes/ui/FitLayout.js');
	load('classes/ui/FlexLayout.js');
	load('classes/ui/FlowLayout.js');
	load('classes/ui/FormatControls.js');
	load('classes/ui/GridLayout.js');
	load('classes/ui/Iframe.js');
	load('classes/ui/Label.js');
	load('classes/ui/Toolbar.js');
	load('classes/ui/MenuBar.js');
	load('classes/ui/MenuButton.js');
	load('classes/ui/ListBox.js');
	load('classes/ui/MenuItem.js');
	load('classes/ui/Menu.js');
	load('classes/ui/Radio.js');
	load('classes/ui/ResizeHandle.js');
	load('classes/ui/Spacer.js');
	load('classes/ui/SplitButton.js');
	load('classes/ui/StackLayout.js');
	load('classes/ui/TabPanel.js');
	load('classes/ui/TextBox.js');
	load('classes/ui/Throbber.js');

	writeScripts();
})(this);

// $hash: 93806f92da9801a6fc97c46edfc1eba8