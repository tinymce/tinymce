(function() {
	var each = tinymce.each, Event = tinymce.dom.Event;
	
	// Skips text nodes that only contain whitespace since they aren't semantically important.
	function skipWhitespaceNodesBackwards(e) {
		while (e && (e.nodeType == 8 || (e.nodeType == 3 && /[ \t\n\r]/.test(e.nodeValue)))) {
			e = e.previousSibling;
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
		
		indent: function() {
			var ed = this.ed, indentAmount, indentUnits, indented = [];
			
			function createWrapItem(element) {
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
			
			function processList(element) {
				each(element.childNodes, indentLI);
				indented.push(element);
			}
			
			this.process({
				'LI': indentLI,
				'OL': processList,
				'UL': processList,
				defaultAction: this.adjustPaddingFunction(true)
			});
			
		},
		
		outdent: function() {
			var ed = this.ed, dom = ed.dom, indentAmount, indentUnits, outdented = [], newIndentAmount;
			
			function outdentLI(element) {
				if (!hasParentInList(ed, element, outdented)) {
					var listElement = element.parentNode;
					var targetParent = element.parentNode.parentNode;
					dom.split(listElement, element);
					if (targetParent.tagName === 'LI') {
						// Nested list, need to split the LI and go back out to the OL/UL element.
						dom.split(targetParent, element);
					} else if (!dom.is(targetParent, 'ol,ul')) {
						dom.rename(element, 'p');
					}
					
					outdented.push(element);
				}
			}
			
			function processList(element) {
				each(element.childNodes, outdentLI);
				outdented.push(element);
			}
			
			this.process({
				'LI': outdentLI,
				'OL': processList,
				'UL': processList,
				defaultAction: this.adjustPaddingFunction(false)
			});
		},
		
		process: function(actions) {
			var sel = this.ed.selection, bookmark = sel.getBookmark();
			each(sel.getSelectedBlocks(), function(element) {
				var action = actions[element.tagName];
				if (!action) {
					action = actions.defaultAction;
				}
				action(element);
			});
			sel.moveToBookmark(bookmark);
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