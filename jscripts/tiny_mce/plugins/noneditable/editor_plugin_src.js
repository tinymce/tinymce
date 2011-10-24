/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	var externalName = 'contenteditable', internalName = 'data-mce-' + externalName;

	function findParentContentEditable(node) {
		var parent = node;

		while (parent) {
			if (parent.nodeType === 1 && parent.getAttribute(internalName)) {
				return parent.getAttribute(internalName) === "false" ? parent : null;
			}

			parent = parent.parentNode;
		}
	};

	function fakeContentEditable(ed) {
		function expandToNonEditable(collapse) {
			var selection = ed.selection, origRng, startState, endState;

			function setEndPoint(start) {
				var elm = findParentContentEditable(start ? selection.getStart() : selection.getEnd());

				if (elm) {
					rng = origRng.duplicate();
					rng.moveToElementText(elm);
					origRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', rng);

					return true;
				}
			};

			origRng = ed.getDoc().selection.createRange();

			startState = setEndPoint(true);
			endState = setEndPoint();

			if (startState || endState) {
				if (typeof(collapse) !== "undefined") {
					origRng.collapse(collapse);
				}

				origRng.select();

				return startState || endState;
			}
		}

		function swapAttributes(nodes, name1, name2) {
			var i, node;

			i = nodes.length;
			while (i--) {
				node = nodes[i];
				node.attr(name2, node.attr(name1));
				node.attr(name1, null);
			}
		};

		ed.parser.addAttributeFilter('contenteditable', function(nodes, name) {
			swapAttributes(nodes, externalName, internalName);
		});

		ed.serializer.addAttributeFilter('data-mce-contenteditable', function(nodes, name) {
			swapAttributes(nodes, internalName, externalName);
		});

		ed.onKeyDown.addToTop(function(ed, e) {
			var keyCode, shiftKey, selection = ed.selection

			keyCode = e.keyCode;
			shiftKey = e.shiftKey;

			// Left arrow
			if (keyCode === 37 || keyCode === 39) {
				if (expandToNonEditable(keyCode === 37)) {
					e.preventDefault();
				}
			}
		});

		ed.onNodeChange.addToTop(function() {
			expandToNonEditable();
		});
	};

	tinymce.create('tinymce.plugins.NonEditablePlugin', {
		init : function(ed, url) {
			var t = this, editClass, nonEditClass, contentEditableAttrName = tinymce.isIE ? internalName : externalName;

			t.editor = ed;
			editClass = " " + tinymce.trim(ed.getParam("noneditable_editable_class", "mceEditable")) + " ";
			nonEditClass = " " + tinymce.trim(ed.getParam("noneditable_noneditable_class", "mceNonEditable")) + " ";

			ed.onPreInit.add(function() {
				if (tinymce.isIE) {
					fakeContentEditable(ed);
				}

				// Convert video elements to image placeholder
				ed.parser.addAttributeFilter('class', function(nodes) {
					var i = nodes.length, className, node;

					while (i--) {
						node = nodes[i];
						className = " " + node.attr("class") + " ";

						if (className.indexOf(editClass) !== -1) {
							node.attr(contentEditableAttrName, "true");
						} else if (className.indexOf(nonEditClass) !== -1) {
							node.attr(contentEditableAttrName, "false");
						}
					}
				});
			});
		},

		getInfo : function() {
			return {
				longname : 'Non editable elements',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/noneditable',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('noneditable', tinymce.plugins.NonEditablePlugin);
})();