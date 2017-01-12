/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce.lists.Plugin", [
	"global!tinymce.PluginManager",
	"global!tinymce.util.Tools",
	"global!tinymce.util.VK",
	"tinymce.lists.core.NodeType",
	"tinymce.lists.core.Delete",
	"tinymce.lists.actions.Indent",
	"tinymce.lists.actions.Outdent",
	"tinymce.lists.actions.ToggleList"
], function (PluginManager, Tools, VK, NodeType, Delete, Indent, Outdent, ToggleList) {
	var queryListCommandState = function (editor, listName) {
		return function () {
			var parentList = editor.dom.getParent(editor.selection.getStart(), 'UL,OL,DL');
			return parentList && parentList.nodeName === listName;
		};
	};

	var setupCommands = function (editor) {
		editor.on('BeforeExecCommand', function (e) {
			var cmd = e.command.toLowerCase(), isHandled;

			if (cmd === "indent") {
				if (Indent.indentSelection(editor)) {
					isHandled = true;
				}
			} else if (cmd === "outdent") {
				if (Outdent.outdentSelection(editor)) {
					isHandled = true;
				}
			}

			if (isHandled) {
				editor.fire('ExecCommand', {command: e.command});
				e.preventDefault();
				return true;
			}
		});

		editor.addCommand('InsertUnorderedList', function (ui, detail) {
			ToggleList.toggleList(editor, 'UL', detail);
		});

		editor.addCommand('InsertOrderedList', function (ui, detail) {
			ToggleList.toggleList(editor, 'OL', detail);
		});

		editor.addCommand('InsertDefinitionList', function (ui, detail) {
			ToggleList.toggleList(editor, 'DL', detail);
		});
	};

	var setupStateHandlers = function (editor) {
		editor.addQueryStateHandler('InsertUnorderedList', queryListCommandState(editor, 'UL'));
		editor.addQueryStateHandler('InsertOrderedList', queryListCommandState(editor, 'OL'));
		editor.addQueryStateHandler('InsertDefinitionList', queryListCommandState(editor, 'DL'));
	};

	var setupTabKey = function (editor) {
		editor.on('keydown', function (e) {
			// Check for tab but not ctrl/cmd+tab since it switches browser tabs
			if (e.keyCode !== 9 || VK.metaKeyPressed(e)) {
				return;
			}

			if (editor.dom.getParent(editor.selection.getStart(), 'LI,DT,DD')) {
				e.preventDefault();

				if (e.shiftKey) {
					Outdent.outdentSelection(editor);
				} else {
					Indent.indentSelection(editor);
				}
			}
		});
	};

	var setupUi = function (editor) {
		var listState = function (listName) {
			return function () {
				var self = this;

				editor.on('NodeChange', function (e) {
					var lists = Tools.grep(e.parents, NodeType.isListNode);
					self.active(lists.length > 0 && lists[0].nodeName === listName);
				});
			};
		};

		var hasPlugin = function (editor, plugin) {
			var plugins = editor.settings.plugins ? editor.settings.plugins : '';
			return Tools.inArray(plugins.split(/[ ,]/), plugin) !== -1;
		};

		if (!hasPlugin(editor, 'advlist')) {
			editor.addButton('numlist', {
				title: 'Numbered list',
				cmd: 'InsertOrderedList',
				onPostRender: listState('OL')
			});

			editor.addButton('bullist', {
				title: 'Bullet list',
				cmd: 'InsertUnorderedList',
				onPostRender: listState('UL')
			});
		}

		editor.addButton('indent', {
			icon: 'indent',
			title: 'Increase indent',
			cmd: 'Indent',
			onPostRender: function (e) {
				var ctrl = e.control;

				editor.on('nodechange', function () {
					var blocks = editor.selection.getSelectedBlocks();
					var disable = false;

					for (var i = 0, l = blocks.length; !disable && i < l; i++) {
						var tag = blocks[i].nodeName;

						disable = (tag === 'LI' && NodeType.isFirstChild(blocks[i]) || tag === 'UL' || tag === 'OL' || tag === 'DD');
					}

					ctrl.disabled(disable);
				});
			}
		});
	};

	PluginManager.add('lists', function (editor) {
		setupUi(editor);
		Delete.setup(editor);

		editor.on('init', function () {
			setupCommands(editor);
			setupStateHandlers(editor);
			setupTabKey(editor);
		});

		return {
			backspaceDelete: function (isForward) {
				Delete.backspaceDelete(editor, isForward);
			}
		};
	});

	return function () {};
});

