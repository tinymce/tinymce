(function() {
	var each = tinymce.each, Event = tinymce.dom.Event;
	
	// Skips text nodes that only contain whitespace since they aren't semantically important.
	function skipWhitespaceNodesBackwards(e) {
		while (e && (e.nodeType == 8 || (e.nodeType == 3 && /[ \t\n\r]/.test(e.nodeValue)))) {
			e = e.previousSibling;
		}
		return e;
	}
	
	function skipWhitespaceNodesForwards(e) {
		while (e && (e.nodeType == 8 || (e.nodeType == 3 && /[ \t\n\r]/.test(e.nodeValue)))) {
			e = e.nextSibling;
		}
		return e;
	}
	
	function hasParentInList(ed, e, list) {
		return ed.dom.getParent(e, function(p) {
			return tinymce.inArray(list, p) != -1;
		});
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
			var ed = this.ed, dom = ed.dom, t = this;
			function makeList(element) {
				var previousList = skipWhitespaceNodesBackwards(element.previousSibling);
				var nextList = skipWhitespaceNodesForwards(element.nextSibling);
				if (previousList && previousList.tagName == targetListType) {
					previousList.appendChild(element);
				} else if (nextList && nextList.tagName == targetListType) {
					nextList.insertBefore(element, nextList.firstChild);
				} else {
					var list = dom.create(targetListType);
					dom.insertAfter(list, element);
					list.appendChild(element);
				}
				dom.rename(element, 'li');
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
				if (element.parentNode.tagName == oppositeListType) {
					dom.split(element.parentNode, element);
					makeList(element);
				} else {
					// TODO: Unapply list.
				}
			}
			
			// TODO: Going to need a mergeAdjacentLists kind of function instead of trying to anticipate the merge all the time.
			
			this.process({
				'LI': changeList,
				'TD': wrapList,
				defaultAction: makeList
			});
		},
		
		indent: function() {
			var ed = this.ed, indentAmount, indentUnits, indented = [];
			
			function createWrapItem(element) {
				if (element.parentNode.parentNode.tagName == 'OL' || element.parentNode.parentNode.tagName == 'UL') {
					// Invalidly nested lists.
					var listType = ed.dom.getParent(element, 'ol,ul').tagName;
					var wrapList = skipWhitespaceNodesBackwards(element.parentNode.previousSibling);
					if (wrapList && wrapList.tagName == 'LI') {
						// The previous list item will have already been indented and we just looked one level up, so we need to drill down another level.
						var nestedList = skipWhitespaceNodesBackwards(wrapList.lastChild);
						if (nestedList && (nestedList.tagName == 'OL' || nestedList.tagName == 'UL')) {
							var lastLI = skipWhitespaceNodesBackwards(nestedList.lastChild);
							if (lastLI && lastLI.tagName == 'LI') {
								return lastLI;
							}
						}
					}
				}
				var wrapItem = skipWhitespaceNodesBackwards(element.previousSibling);
				if (!wrapItem || wrapItem.nodeName != 'LI') {
					wrapItem = ed.dom.create('li', { style: 'list-style-type: none;'});
					ed.dom.insertAfter(wrapItem, element);
				}
				return wrapItem;
			}
			
			function createWrapList(element) {
				var wrapItem = createWrapItem(element);
				var listType = ed.dom.getParent(element, 'ol,ul').tagName;
				var wrapList = skipWhitespaceNodesBackwards(wrapItem.lastChild);
				if (!wrapList || wrapList.tagName != listType) {
					wrapList = ed.dom.create(ed.dom.getParent(element, 'ol,ul').tagName);
					wrapItem.appendChild(wrapList);
				}
				return wrapList;
			}
			
			function indentLI(element) {
				if (!hasParentInList(ed, element, indented)) {
					var wrapList = createWrapList(element);
					wrapList.appendChild(element);
					indented.push(element);
				}
			}
			
			this.process({
				'LI': indentLI,
				defaultAction: this.adjustPaddingFunction(true)
			});
			
		},
		
		outdent: function() {
			var ed = this.ed, dom = ed.dom, indentAmount, indentUnits, outdented = [], newIndentAmount;
			
			function outdentLI(element) {
				if (!hasParentInList(ed, element, outdented)) {
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

					outdented.push(element);
				}
			}
			
			this.process({
				'LI': outdentLI,
				defaultAction: this.adjustPaddingFunction(false)
			});
		},
		
		process: function(actions) {
			var sel = this.ed.selection, bookmark = sel.getBookmark(), dom = this.ed.dom;
			function processElement(element) {
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
				each(element.childNodes, processElement);
			}
			actions.OL = actions.UL = recurse;
			this.splitSafeEach(sel.getSelectedBlocks(), processElement);
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
				currentIndent = parseInt(ed.dom.getStyle(element, 'padding-left') || 0);
				if (isIndent) {
					newIndentAmount = currentIndent + indentAmount;
				} else {
					newIndentAmount = currentIndent - indentAmount;
				}
				ed.dom.setStyle(element, 'padding-left', newIndentAmount > 0 ? newIndentAmount + indentUnits : '');
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