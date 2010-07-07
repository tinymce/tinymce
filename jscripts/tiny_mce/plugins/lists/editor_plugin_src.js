(function() {
	var each = tinymce.each, Event = tinymce.dom.Event;
	
	// Skips text nodes that only contain whitespace since they aren't semantically important.
	function skipWhitespaceNodesBackwards(e) {
		return skipWhitespaceNodes(e, function(e) { return e.previousSibling; });
	}
	
	function skipWhitespaceNodesForwards(e) {
		return skipWhitespaceNodes(e, function(e) { return e.nextSibling; });
	}
	
	function skipWhitespaceNodes(e, next) {
		while (e && (e.nodeType == 8 || (e.nodeType == 3 && /^[ \t\n\r]*$/.test(e.nodeValue)))) {
			e = next(e);
		}
		return e;
	}
	
	function hasParentInList(ed, e, list) {
		return ed.dom.getParent(e, function(p) {
			return tinymce.inArray(list, p) != -1;
		});
	}
	
	function isList(e) {
		return e && (e.tagName == 'OL' || e.tagName == 'UL');
	}
	
	function splitNestedLists(element, dom) {
		var tmp, nested, wrapItem;
		tmp = skipWhitespaceNodesBackwards(element.lastChild);
		while (isList(tmp)) {
			nested = tmp;
			tmp = skipWhitespaceNodesBackwards(nested.previousSibling);
		}
		if (nested) {
			wrapItem = dom.create('li', { style: 'list-style-type: none;'});
			dom.split(element, nested);
			dom.insertAfter(wrapItem, nested);
			wrapItem.appendChild(nested);
			wrapItem.appendChild(nested);
			element = wrapItem.previousSibling;
		}
		return element;
	}
	
	function attemptMergeWithAdjacent(e) {
		e = attemptMergeWithPrevious(e);
		return attemptMergeWithNext(e);
	}
	
	function attemptMergeWithPrevious(e) {
		var prev = skipWhitespaceNodesBackwards(e.previousSibling);
		if (prev) {
			return attemptMerge(prev, e);
		} else {
			return e;
		}
	}
	
	function attemptMergeWithNext(e) {
		var next = skipWhitespaceNodesForwards(e.nextSibling);
		if (next) {
			return attemptMerge(e, next);
		} else {
			return e;
		}
	}
	
	function attemptMerge(previous, element) {
		if (canMerge(previous, element)) {
			return merge(previous, element);
		} else if (previous.tagName == 'LI' && isList(element)) {
			// Fix invalidly nested lists.
			previous.appendChild(element);
		}
		return element;
	}
	
	// TODO: Should compare attributes/styles.
	function canMerge(e1, e2) {
		if (!e1 || !e2) {
			return false;
		} else if (e1.tagName == 'LI' && e2.tagName == 'LI') {
			return e2.style.listStyleType == 'none' || containsOnlyAList(e2);
		} else if (isList(e1)) {
			return e1.tagName == e2.tagName || isListForIndent(e2);
		} else {
			return false;
		}
	}
	
	function isListForIndent(e) {
		var firstLI = skipWhitespaceNodesForwards(e.firstChild), lastLI = skipWhitespaceNodesBackwards(e.lastChild);
		return firstLI && lastLI && isList(e) && firstLI == lastLI && (isList(firstLI) || firstLI.style.listStyleType == 'none'  || containsOnlyAList(firstLI));
	}
	
	function containsOnlyAList(e) {
		var firstChild = skipWhitespaceNodesForwards(e.firstChild), lastChild = skipWhitespaceNodesBackwards(e.lastChild);
		return firstChild && lastChild && firstChild == lastChild && isList(firstChild);
	}
	
	function merge(e1, e2) {
		var lastOriginal = skipWhitespaceNodesBackwards(e1.lastChild), firstNew = skipWhitespaceNodesForwards(e2.firstChild);
		while (e2.firstChild) {
			e1.appendChild(e2.firstChild);
		}
		e2.parentNode.removeChild(e2);
		attemptMerge(lastOriginal, firstNew);
		return e1;
	}
	
	tinymce.create('tinymce.ephox.plugins.Lists', {
		init: function(ed, url) {
			this.ed = ed;
			ed.addCommand('Indent', this.indent, this);
			ed.addCommand('Outdent', this.outdent, this);
			ed.addCommand('InsertUnorderedList', function() {
				this.applyList('UL', 'OL');
			}, this);
			ed.addCommand('InsertOrderedList', function() {
				this.applyList('OL', 'UL');
			}, this);
			
			ed.onKeyUp.add(function(ed, e) {
				if (e.keyCode === 9) {
					ed.execCommand(e.shiftKey ? 'Outdent' : 'Indent', true, null);
					return Event.cancel(e);
				}
			});
			
			function cancelTab(ed, e) {
				if (e.keyCode === 9)
					return Event.cancel(e);
			}
			ed.onKeyPress.add(cancelTab);
			ed.onKeyDown.add(cancelTab);
		},
		
		applyList: function(targetListType, oppositeListType) {
			var ed = this.ed, dom = ed.dom, t = this, applied = [];
			function makeList(element) {
				var list = dom.create(targetListType);
				dom.insertAfter(list, element);
				list.appendChild(element);
				
				if (element.tagName == 'LI') {
					// No change required.
				} else if (element.tagName == 'P') {
					// Convert the element to an LI.
					element = dom.rename(element, 'li');
				} else {
					// Put the list around the element.
					var li = dom.create('li');
					dom.insertAfter(li, element);
					li.appendChild(element);
					element = li;
				}
				attemptMergeWithAdjacent(list);
				applied.push(element);
			}
			
			function wrapList(element) {
				var li = dom.create('li');
				while (element.firstChild) {
					li.appendChild(element.firstChild);
				}
				element.appendChild(li);
				makeList(li);
			}
			
			function changeList(element) {
				if (tinymce.inArray(applied, element) != -1) {
					return;
				}
				if (element.parentNode.tagName == oppositeListType) {
					dom.split(element.parentNode, element);
					makeList(element);
					attemptMergeWithNext(element.parentNode);
				} else {
					convertListItemToParagraph(element);
				}
				applied.push(element);
			}
			
			function convertListItemToParagraph(element) {
				// First split off any nested elements.
				element = splitNestedLists(element, dom);
				// Split all the way out to the body.
				while (element.parentNode !== dom.getRoot()) {
					dom.split(element.parentNode, element);
				}
				dom.rename(element, 'p');
			}
			
			this.process({
				'LI': changeList,
//				'TD': wrapList,
				'H1': makeList,
				'H2': makeList,
				'H3': makeList,
				'H4': makeList,
				'H5': makeList,
				'H6': makeList,
				'P': makeList,
				'DIV': makeList,
				defaultAction: wrapList
			});
		},
		
		indent: function() {
			var ed = this.ed, dom = ed.dom, indentAmount, indentUnits, indented = [];
			
			function createWrapItem(element) {
				var wrapItem = dom.create('li', { style: 'list-style-type: none;'});
				dom.insertAfter(wrapItem, element);
				return wrapItem;
			}
			
			function createWrapList(element) {
				var wrapItem = createWrapItem(element);
				var list = dom.getParent(element, 'ol,ul');
				var listType = list.tagName;
				var listStyle = dom.getStyle(list, 'list-style-type');
				var attrs = {};
				if (listStyle != '') {
					attrs.style = 'list-style-type: ' + listStyle + ';';
				}
				var wrapList = dom.create(listType, attrs);
				wrapItem.appendChild(wrapList);
				return wrapList;
			}
			
			function indentLI(element) {
				if (!hasParentInList(ed, element, indented)) {
					element = splitNestedLists(element, dom);
					var wrapList = createWrapList(element);
					wrapList.appendChild(element);
					attemptMergeWithAdjacent(wrapList.parentNode);
					attemptMergeWithAdjacent(wrapList);
					indented.push(element);
				}
			}
			
			this.process({
				'LI': indentLI,
				defaultAction: this.adjustPaddingFunction(true)
			});
			
		},
		
		outdent: function() {
			var t = this, ed = t.ed, dom = ed.dom, indentAmount, indentUnits, outdented = [], newIndentAmount;
			
			function outdentLI(element) {
				if (!hasParentInList(ed, element, outdented)) {
					if (dom.getStyle(element, 'margin-left') != '' || dom.getStyle(element, 'padding-left') != '') {
						return t.adjustPaddingFunction(false)(element);
					}
					element = splitNestedLists(element, dom);
					var listElement = element.parentNode;
					var targetParent = element.parentNode.parentNode;
					if (targetParent.tagName == 'P') {
						dom.split(targetParent, element.parentNode);
					} else {
						dom.split(listElement, element);
						if (targetParent.tagName === 'LI') {
							// Nested list, need to split the LI and go back out to the OL/UL element.
							dom.split(targetParent, element);
						} else if (!dom.is(targetParent, 'ol,ul')) {
							dom.rename(element, 'p');
						}
					}
					attemptMergeWithAdjacent(element);
					outdented.push(element);
				}
			}
			
			this.process({
				'LI': outdentLI,
				defaultAction: this.adjustPaddingFunction(false)
			});
		},
		
		process: function(actions) {
			var t = this, sel = t.ed.selection, bookmark = sel.getBookmark(), dom = t.ed.dom;
			function processElement(element) {
				dom.removeClass(element, '_mce_act_on');
				if (element.nodeType != 1) {
					return;
				}
				var action = actions[element.tagName];
				if (!action) {
					action = actions.defaultAction;
				}
				action(element);
			}
			function recurse(element) {
				t.splitSafeEach(element.childNodes, processElement);
			}
			actions.OL = actions.UL = recurse;
			t.splitSafeEach(sel.getSelectedBlocks(), processElement);
			sel.moveToBookmark(bookmark);
		},
		
		splitSafeEach: function(elements, f) {
			if (tinymce.isGecko && (/Firefox\/[12]\.[0-9]/.test(navigator.userAgent) ||
					/Firefox\/3\.[0-4]/.test(navigator.userAgent))) {
				this.classBasedEach(elements, f);
			} else {
				each(elements, f);
			}
		},
		
		classBasedEach: function(elements, f) {
			var dom = this.ed.dom;
			// Mark nodes
			each(elements, function(element) {
				dom.addClass(element, '_mce_act_on');
			});
			var nodes = dom.select('._mce_act_on');
			while (nodes.length > 0) {
				var element = nodes.shift();
				dom.removeClass(element, '_mce_act_on');
				f(element);
				nodes = dom.select('._mce_act_on');
			}
		},
		
		adjustPaddingFunction: function(isIndent) {
			var indentAmount, indentUnits, ed = this.ed;
			indentAmount = ed.settings.indentation;
			indentUnits = /[a-z%]+/i.exec(indentAmount);
			indentAmount = parseInt(indentAmount);
			return function(element) {
				var currentIndent, newIndentAmount;
				currentIndent = parseInt(ed.dom.getStyle(element, 'margin-left') || 0) + parseInt(ed.dom.getStyle(element, 'padding-left') || 0);
				if (isIndent) {
					newIndentAmount = currentIndent + indentAmount;
				} else {
					newIndentAmount = currentIndent - indentAmount;
				}
				ed.dom.setStyle(element, 'padding-left', '');
				ed.dom.setStyle(element, 'margin-left', newIndentAmount > 0 ? newIndentAmount + indentUnits : '');
			};
		},
		
		getInfo: function() {
			return {
				longname : 'Lists',
				author : 'Ephox Corporation',
				authorurl : 'http://tinymce.ephox.com',
				infourl : 'http://tinymce.ephox.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});
	tinymce.PluginManager.add("lists", tinymce.ephox.plugins.Lists);
})();