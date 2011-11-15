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

	// Checks if the specified node is uneditable
	function isUneditable(node) {
		return node && node.nodeType === 1 && (node.getAttribute(internalName) || node.contentEditable) === "false";
	};

	// Finds the first uneditable parent node
	function findUneditableParent(node) {
		var parent = node;

		while (parent) {
			if (parent.nodeType === 1 && parent.getAttribute(internalName)) {
				return parent.getAttribute(internalName) === "false" ? parent : null;
			}

			parent = parent.parentNode;
		}
	};

	function fakeContentEditable(ed) {
		var dom = ed.dom;

		function expandToNonEditable(collapse) {
			var selection = ed.selection, origRng, startState, endState;

			function setEndPoint(start) {
				var elm = findUneditableParent(start ? selection.getStart() : selection.getEnd());

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

			// Left/right arrow
			if (keyCode === 37 || keyCode === 39) {
				if (expandToNonEditable(keyCode === 37)) {
					e.preventDefault();
				}
			}
		});

		ed.onNodeChange.addToTop(function() {
			//expandToNonEditable();
		});

		ed.onClick.add(function(ed, e) {
			var elm = findUneditableParent(e.target);

			if (elm) {
				insertCaretContainer(elm, true);
			}
		});

		ed.onKeyDown.add(function(ed, e) {
			var node = ed.selection.getStart(), caretContainer, keyCode = e.keyCode, sibling;

			do {
				if (node.id === '_mce_caretcontainer') {
					caretContainer = node;
					break;
				}

				node = node.parentNode;
			} while (node);

			if (caretContainer) {
				sibling = caretContainer.previousSibling;
				if (keyCode === 8 && isUneditable(sibling)) {
					e.preventDefault();
					dom.remove(sibling);
				}

				sibling = caretContainer.nextSibling;
				if (keyCode === 46 && isUneditable(sibling)) {
					e.preventDefault();
					dom.remove(sibling);
				}

				removeCaretContainer();
			}
		});
		
		function insertCaretContainer(node, before) {
			var caretContainer, rng;

			removeCaretContainer();
			caretContainer = dom.create('span', {'id': '_mce_caretcontainer', 'data-mce-bogus' : true}, '\uFEFF\uFEFF');

			if (before) {
				node.parentNode.insertBefore(caretContainer, node);
			} else {
				dom.insertAfter(caretContainer, node);
			}

			// Move caret in to the middle of caret container
			rng = dom.createRng();
			rng.setStart(caretContainer.firstChild, 1);
			rng.setEnd(caretContainer.firstChild, 1);
			ed.selection.setRng(rng);
			ed.nodeChanged();
		};

		function removeCaretContainer() {
			var elm;

			while (elm = dom.get('_mce_caretcontainer')) {
				dom.remove(elm, elm.innerHTML !== '\uFEFF\uFEFF');
			}
		};
	};

	tinymce.create('tinymce.plugins.NonEditablePlugin', {
		init : function(ed, url) {
			var t = this, editClass, nonEditClass, contentEditableAttrName = !tinymce.isIE ? internalName : externalName;

			t.editor = ed;
			editClass = " " + tinymce.trim(ed.getParam("noneditable_editable_class", "mceEditable")) + " ";
			nonEditClass = " " + tinymce.trim(ed.getParam("noneditable_noneditable_class", "mceNonEditable")) + " ";

			ed.onPreInit.add(function() {
				fakeContentEditable(ed);

				// Apply contentEditable true/false on elements with the noneditable/editable classes
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