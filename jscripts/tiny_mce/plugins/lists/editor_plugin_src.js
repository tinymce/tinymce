(function() {
	var each = tinymce.each, Event = tinymce.dom.Event;

	// Skips text nodes that only contain whitespace since they aren't semantically important.
	function skipWhitespaceNodes(e, next) {
		while (e && (e.nodeType === 8 || (e.nodeType === 3 && /^[ \t\n\r]*$/.test(e.nodeValue)))) {
			e = next(e);
		}
		return e;
	}
	
	function skipWhitespaceNodesBackwards(e) {
		return skipWhitespaceNodes(e, function(e) { return e.previousSibling; });
	}
	
	function skipWhitespaceNodesForwards(e) {
		return skipWhitespaceNodes(e, function(e) { return e.nextSibling; });
	}
	
	function hasParentInList(ed, e, list) {
		return ed.dom.getParent(e, function(p) {
			return tinymce.inArray(list, p) !== -1;
		});
	}
	
	function isList(e) {
		return e && (e.tagName === 'OL' || e.tagName === 'UL');
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
	
	function attemptMergeWithAdjacent(e, allowDifferentListStyles) {
		e = attemptMergeWithPrevious(e, allowDifferentListStyles);
		return attemptMergeWithNext(e, allowDifferentListStyles);
	}
	
	function attemptMergeWithPrevious(e, allowDifferentListStyles) {
		var prev = skipWhitespaceNodesBackwards(e.previousSibling);
		if (prev) {
			return attemptMerge(prev, e, allowDifferentListStyles ? prev : false);
		} else {
			return e;
		}
	}
	
	function attemptMergeWithNext(e, allowDifferentListStyles) {
		var next = skipWhitespaceNodesForwards(e.nextSibling);
		if (next) {
			return attemptMerge(e, next, allowDifferentListStyles ? next : false);
		} else {
			return e;
		}
	}
	
	function attemptMerge(e1, e2, differentStylesMasterElement) {
		if (canMerge(e1, e2, !!differentStylesMasterElement)) {
			return merge(e1, e2, differentStylesMasterElement);
		} else if (e1.tagName === 'LI' && isList(e2)) {
			// Fix invalidly nested lists.
			e1.appendChild(e2);
		}
		return e2;
	}
	
	function canMerge(e1, e2, allowDifferentListStyles) {
		if (!e1 || !e2) {
			return false;
		} else if (e1.tagName === 'LI' && e2.tagName === 'LI') {
			return e2.style.listStyleType === 'none' || containsOnlyAList(e2);
		} else if (isList(e1)) {
			return (e1.tagName === e2.tagName && (allowDifferentListStyles || e1.style.listStyleType === e2.style.listStyleType)) || isListForIndent(e2);
		} else {
			return false;
		}
	}
	
	function isListForIndent(e) {
		var firstLI = skipWhitespaceNodesForwards(e.firstChild), lastLI = skipWhitespaceNodesBackwards(e.lastChild);
		return firstLI && lastLI && isList(e) && firstLI === lastLI && (isList(firstLI) || firstLI.style.listStyleType === 'none'  || containsOnlyAList(firstLI));
	}
	
	function containsOnlyAList(e) {
		var firstChild = skipWhitespaceNodesForwards(e.firstChild), lastChild = skipWhitespaceNodesBackwards(e.lastChild);
		return firstChild && lastChild && firstChild === lastChild && isList(firstChild);
	}
	
	function merge(e1, e2, masterElement) {
		var lastOriginal = skipWhitespaceNodesBackwards(e1.lastChild), firstNew = skipWhitespaceNodesForwards(e2.firstChild);
		while (e2.firstChild) {
			e1.appendChild(e2.firstChild);
		}
		if (masterElement) {
			e1.style.listStyleType = masterElement.style.listStyleType;
		}
		e2.parentNode.removeChild(e2);
		attemptMerge(lastOriginal, firstNew, false);
		return e1;
	}
	
	tinymce.create('tinymce.ephox.plugins.Lists', {
		init: function(ed, url) {
			function isTriggerKey(e) {
				return e.keyCode === 9 && (ed.queryCommandState('InsertUnorderedList') || ed.queryCommandState('InsertOrderedList'));
			}
			function cancelTab(ed, e) {
				if (isTriggerKey(e)) {
					return Event.cancel(e);
				}
			}
			
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
				if (isTriggerKey(e)) {
					ed.execCommand(e.shiftKey ? 'Outdent' : 'Indent', true, null);
					return Event.cancel(e);
				}
			});
			
			ed.onKeyPress.add(cancelTab);
			ed.onKeyDown.add(cancelTab);
		},
		
		applyList: function(targetListType, oppositeListType) {
			var t = this, ed = t.ed, dom = ed.dom, applied = [], hasSameType = false, hasOppositeType = false, hasNonList = false, actions;
			function splitBrs(e) {
				each(dom.select('br', e), function(br) {
					dom.split(e, br);
					dom.remove(br);
				});
			}
			function makeList(element) {
				var list = dom.create(targetListType), li;
				function adjustIndentForNewList(element) {
					// If there's a margin-left, outdent one level to account for the extra list margin.
					if (element.style.marginLeft || element.style.paddingLeft) {
						t.adjustPaddingFunction(false)(element);
					}
				}
				dom.insertAfter(list, element);
				list.appendChild(element);
				
				if (element.tagName === 'LI') {
					// No change required.
				} else if (element.tagName === 'P') {
					// Convert the element to an LI.
					element = dom.rename(element, 'li');
					adjustIndentForNewList(element);
				} else {
					// Put the list around the element.
					li = dom.create('li');
					dom.insertAfter(li, element);
					li.appendChild(element);
					adjustIndentForNewList(element);
					element = li;
				}
				attemptMergeWithAdjacent(list, true);
				applied.push(element);
			}
			
			function doWrapList(start, end) {
				var li = dom.create('li'), n = start, tmp;
				start.parentNode.insertBefore(li, start);
				while (n != end) {
					tmp = n.nextSibling;
					li.appendChild(n);
					n = tmp;
				}
				makeList(li);
			}
			
			function wrapList(element) {
				var startSection, previousBR;
				function isAnyPartSelected(start, end) {
					var r = dom.createRng(), sel = ed.selection.getRng(true);
					if (!end) {
						end = start.parentNode.lastChild;
					}
					r.setStartBefore(start);
					r.setEndAfter(end);
					return !(r.compareBoundaryPoints(Range.END_TO_START, sel) === 1 || r.compareBoundaryPoints(Range.START_TO_END, sel) === -1);
				}
				// Split on BRs within the range and process those.
				startSection = element.firstChild;
				each(dom.select('br', element), function(br) {
					// Got a section from start to br.
					var tmp = br.nextSibling;
					if (isAnyPartSelected(startSection, br)) { // TODO: Handle adjacent BRs.
						// Need to indent this part
						doWrapList(startSection, br);
						dom.remove(br);
						if (previousBR) {
							dom.remove(previousBR);
						}
						previousBR = null;
					} else {
						previousBR = br;
					}
					startSection = tmp;
				});
				if (startSection && isAnyPartSelected(startSection, startSection.parentNode.lastChild)) {
					doWrapList(startSection, undefined);
					if (previousBR) {
						dom.remove(previousBR);
					}
				}
			}
			
			function changeList(element) {
				if (tinymce.inArray(applied, element) !== -1) {
					return;
				}
				if (element.parentNode.tagName === oppositeListType) {
					dom.split(element.parentNode, element);
					makeList(element);
					attemptMergeWithNext(element.parentNode, false);
				}
				applied.push(element);
			}
			
			function convertListItemToParagraph(element) {
				if (tinymce.inArray(applied, element) !== -1) {
					return;
				}
				element = splitNestedLists(element, dom);
				while (dom.is(element.parentNode, 'ol,ul,li')) {
					dom.split(element.parentNode, element);
				}
				dom.rename(element, 'p');
				applied.push(element);
			}
			
			
			each(ed.selection.getSelectedBlocks(), function(e) {
				if (e.tagName === oppositeListType || (e.tagName === 'LI' && e.parentNode.tagName === oppositeListType)) {
					hasOppositeType = true;
				} else if (e.tagName === targetListType || (e.tagName === 'LI' && e.parentNode.tagName === targetListType)) {
					hasSameType = true;
				} else {
					hasNonList = true;
				}
			});

			if (hasNonList || hasOppositeType) {
				actions = {
					'LI': changeList,
					'H1': makeList,
					'H2': makeList,
					'H3': makeList,
					'H4': makeList,
					'H5': makeList,
					'H6': makeList,
					'P': makeList,
					'DIV': makeList,
					defaultAction: wrapList
				};
			} else {
				actions = {
					defaultAction: convertListItemToParagraph
				};
			}
			this.process(actions);
		},
		
		indent: function() {
			var ed = this.ed, dom = ed.dom, indented = [];
			
			function createWrapItem(element) {
				var wrapItem = dom.create('li', { style: 'list-style-type: none;'});
				dom.insertAfter(wrapItem, element);
				return wrapItem;
			}
			
			function createWrapList(element) {
				var wrapItem = createWrapItem(element),
					list = dom.getParent(element, 'ol,ul'),
					listType = list.tagName,
					listStyle = dom.getStyle(list, 'list-style-type'),
					attrs = {},
					wrapList;
				if (listStyle !== '') {
					attrs.style = 'list-style-type: ' + listStyle + ';';
				}
				wrapList = dom.create(listType, attrs);
				wrapItem.appendChild(wrapList);
				return wrapList;
			}
			
			function indentLI(element) {
				if (!hasParentInList(ed, element, indented)) {
					element = splitNestedLists(element, dom);
					var wrapList = createWrapList(element);
					wrapList.appendChild(element);
					attemptMergeWithAdjacent(wrapList.parentNode, false);
					attemptMergeWithAdjacent(wrapList, false);
					indented.push(element);
				}
			}
			
			this.process({
				'LI': indentLI,
				defaultAction: this.adjustPaddingFunction(true)
			});
			
		},
		
		outdent: function() {
			var t = this, ed = t.ed, dom = ed.dom, outdented = [];
			
			function outdentLI(element) {
				var listElement, targetParent;
				if (!hasParentInList(ed, element, outdented)) {
					if (dom.getStyle(element, 'margin-left') !== '' || dom.getStyle(element, 'padding-left') !== '') {
						return t.adjustPaddingFunction(false)(element);
					}
					element = splitNestedLists(element, dom);
					listElement = element.parentNode;
					targetParent = element.parentNode.parentNode;
					if (targetParent.tagName === 'P') {
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
			
			each(outdented, attemptMergeWithAdjacent);
		},
		
		process: function(actions) {
			var t = this, sel = t.ed.selection, bookmark = sel.getBookmark(), dom = t.ed.dom;
			function processElement(element) {
				dom.removeClass(element, '_mce_act_on');
				if (!element || element.nodeType !== 1) {
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
			// TODO: Probably only required when in a table (maybe also images)
			t.ed.execCommand('mceRepaint');
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
			var dom = this.ed.dom, nodes, element;
			// Mark nodes
			each(elements, function(element) {
				dom.addClass(element, '_mce_act_on');
			});
			nodes = dom.select('._mce_act_on');
			while (nodes.length > 0) {
				element = nodes.shift();
				dom.removeClass(element, '_mce_act_on');
				f(element);
				nodes = dom.select('._mce_act_on');
			}
		},
		
		adjustPaddingFunction: function(isIndent) {
			var indentAmount, indentUnits, ed = this.ed;
			indentAmount = ed.settings.indentation;
			indentUnits = /[a-z%]+/i.exec(indentAmount);
			indentAmount = parseInt(indentAmount, 10);
			return function(element) {
				var currentIndent, newIndentAmount;
				currentIndent = parseInt(ed.dom.getStyle(element, 'margin-left') || 0, 10) + parseInt(ed.dom.getStyle(element, 'padding-left') || 0, 10);
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
}());