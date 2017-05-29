/**
 * plugin.js
 *
 * Definition list plugin
 * Forbes Library
 */

/*global tinymce:true */

// TODO: Merge consecutive lists.
// TODO: Make ToggleDefinitionItem work on multiple items at once.
// TODO: Restore selection where possible

tinymce.PluginManager.add('definitionlist', definitionListPlugin);

/**
 * Plugin for definition lists.
 */
function definitionListPlugin(editor, url) {
	editor.contentCSS.push(url + '/plugin-style.css');

	editor.addCommand('ToggleDefinitionItem', toggleDefinitionItem);
	editor.addCommand('ToggleDefinitionList', toggleDefinitionList);

	editor.on('keydown', changeKeyBehavior);

	editor.addButton('ToggleDefinitionItem', {
		text: 'DT↔DD',
		tooltip: 'Switch Between Term and Definition',
		icon: false,
		cmd: 'ToggleDefinitionItem',
		onPostRender: function() {
			var self = this;
			editor.on('NodeChange', function(e) {
				self.disabled(!editor.dom.getParent(e.element, 'dl>dt,dl>dd'));
			});
		}
	});

	editor.addButton('ToggleDefinitionList', {
		text: 'DL',
		tooltip: 'Definition List',
		icon: false,
		cmd: 'ToggleDefinitionList',
		stateSelector: 'dl'
	});

	/**
	 * Change tab key and enter key behavior when editing definition lists.
	 */
	function changeKeyBehavior(e) {
		var defItem;

		if (e.keyCode == 13) {
			// consecutive enter keys will split definition lists
			defItem = editor.dom.getParent(editor.selection.getNode(), 'dt, dd');
			if (defItem && editor.dom.isEmpty(defItem)) {
				e.preventDefault();
				var dl = editor.dom.getParent(editor.selection.getNode(), 'dl');
				var p = editor.dom.rename(defItem, 'p');
				editor.dom.split(dl, p);
			}
		}
		if (e.keyCode == 9) {
			// tab key will toggle dt and dd
			defItem = editor.dom.getParent(editor.selection.getNode(), 'dt, dd');
			if (defItem) {
				e.preventDefault();
				editor.execCommand('ToggleDefinitionItem');
				return false;
			}
		}
	}

	/**
	 * If the selection is in a DT make it a DD and viceversa.
	 */
	function toggleDefinitionItem() {
		var sel = editor.selection;
		var dom = editor.dom;
		var bookmark;

		var p = dom.getParent(sel.getNode(), 'dt');
		if (p) {
			bookmark = sel.getBookmark();
			dom.rename(p, 'dd');
			sel.moveToBookmark(bookmark);
			return;
		}
		p = dom.getParent(sel.getNode(), 'dd');
		if (p) {
			bookmark = sel.getBookmark();
			dom.rename(p, 'dt');
			sel.moveToBookmark(bookmark);
		}
	}

	/**
	 * Adds or removes the nodes in the range to a selection list.
	 */
	function toggleDefinitionList() {
		var sel = editor.selection;
		var rng = sel.getRng();
		var dom = editor.dom;
		var bookmark;

		var listElem = dom.getParent(sel.getNode(), 'dl,ul,ol');

		if (listElem) {
			// We are in an existing list.
			if (listElem.nodeName.toUpperCase() == 'DL') {
				bookmark = sel.getBookmark();
				demoteDefListItems(listElem, rng);
				sel.moveToBookmark(bookmark);
			} else {
				convertListItemsToDefTerms(listElem, rng);
			}
		} else {
			// We are not in an existing list.
			var p = dom.getParent(sel.getNode(), 'p');
			if (p) {
				// Selection contained in a paragraph. We will make it the first term of a new list.
				bookmark = sel.getBookmark();
				var dt = dom.rename(p, 'dt');
				listElem = wrap(dt, 'dl');
				sel.moveToBookmark(bookmark);
			} else if (!sel.isCollapsed()) {
				// We will walk over the nodes intersecting the range. We want p, ul>li, and ol>li
				var nodes = getIntersectingNodes(rng, true);
				listElem = dom.getParent(nodes[0], 'dl');
				if (!listElem) {
					listElem = dom.create('dl');
					dom.insertAfter(listElem, nodes[0]);
				}

				tinymce.each(nodes, function(node) {
					var dt;
					if (dom.is(node, 'p, li, dt')) {
						dt = dom.rename(node, 'dt');
					} else {
						dt = wrap(node, 'dt');
					}
					try {
						dom.add(listElem, dt);
					} catch (e) { } // we sometimes get errors when adding an element that is contained in the original list
					sel.setCursorLocation(dt);
				});

				//sel.setCursorLocation(0);
			} // otherwise
				// selection is collapsed but not in a listitem or p
				// do nothing
		}
		dom.remove(dom.select('dl:empty'));
	}

	/**
	 * Creates a new element and wraps it around an existing element.
	 *
	 * Returns the wrapper.
	 */
	function wrap(elem, wrapperName) {
		var dom = editor.dom;
		var wrapper = dom.create(wrapperName);
		dom.insertAfter(wrapper, elem);
		dom.add(wrapper, elem);
		return wrapper;
	}

	/**
	 * Given a DOM range, this function returns its children, including
	 * those nodes at the beginning and end which may only be partially
	 * within the range.
	 */
	function getIntersectingNodes(range, expandLists) {
		var container = range.commonAncestorContainer;
		var nodeList = [];

		tinymce.each(container.childNodes, function(node) {
			var dom = editor.dom;
			if (range.intersectsNode(node)) {
				if (expandLists && dom.is(node, 'ul, ol, dl')) {
					tinymce.each(node.childNodes, function(n) {
						nodeList.push(n);
					});
				} else if (expandLists && dom.is(node, 'p') && node.childNodes.length == 1 && dom.is(node.childNodes[0], 'ul, ol, dl')) {
					tinymce.each(node.childNodes[0].childNodes, function(n) {
						nodeList.push(n);
					});
				} else {
					nodeList.push(node);
				}
			}
		});
		return nodeList;
	}

	/**
	 * Splits a definition list around the specified range, converting dd
	 * and dt elements to paragraphs.
	 */
	function demoteDefListItems(listElem, range) {
		var dom = editor.dom;
		var nodes = [];
		var listItem = dom.getParent(range.commonAncestorContainer, 'dt,dd');

		// Here we select nodes to split on
		if (listItem) {
			// Range is entirely within a list item
			nodes.push(listItem);
		} else {
			// Range must span several list items
			nodes = getIntersectingNodes(range);
		}

		// Here we manipulate the dom
		var p = dom.rename(nodes.shift(), 'p');
		dom.split(listElem, p);
		tinymce.each(nodes, function(node) {
			var lastP = p;
			p = dom.rename(node, 'p');
			dom.insertAfter(p, lastP);
		});
	}

	/**
	 * Splits a ordered or unordered list around the specified range, adding each
	 * list item to as a definition term in a new definition list.
	 */
	function convertListItemsToDefTerms(listElem, range) {
		var dom = editor.dom;
		var nodes = [];
		var listItem = dom.getParent(range.commonAncestorContainer, 'li');

		// Here we select nodes to split on
		if (listItem) {
			// Range is entirely within a list item
			nodes.push(listItem);
		} else {
			// Range must span several list items
			nodes = getIntersectingNodes(range);
		}

		// Here we manipulate the dom
		var firstDT = dom.rename(nodes.shift(), 'dt');
		dom.split(listElem, firstDT);
		var defList = wrap(firstDT, 'dl');
		tinymce.each(nodes, function(node) {
			var dt = dom.rename(node, 'dt');
			dom.add(defList, dt);
		});
	}

}
