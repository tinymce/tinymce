(function() {
	var each = tinymce.each, Event = tinymce.dom.Event;
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
			
			indentAmount = ed.settings.indentation;
			indentUnits = /[a-z%]+/i.exec(indentAmount);
			indentAmount = parseInt(indentAmount);
			
			function createWrapItem(element) {
				var wrapItem = element.previousSibling;
				while (wrapItem && wrapItem.nodeType != 1) {
					wrapItem = wrapItem.previousSibling;
				}
				if (!wrapItem || wrapItem.nodeName != 'LI') {
					wrapItem = ed.dom.create('li', { style: 'list-style-type: none;'});
					ed.dom.insertAfter(wrapItem, element);
				}
				return wrapItem;
			}
			
			function createWrapList(element) {
				var wrapItem = createWrapItem(element);
				var listType = ed.dom.getParent(element, 'ol,ul').tagName;
				var wrapList = wrapItem.lastChild;
				while (wrapList && wrapList.nodeType != 1) {
					wrapList = wrapList.previousSibling;
				}
				if (!wrapList || wrapList.tagName != listType) {
					wrapList = ed.dom.create(ed.dom.getParent(element, 'ol,ul').tagName);
					wrapItem.appendChild(wrapList);
				}
				return wrapList;
			}
			
			function indentLI(element) {
				var indentedParent = ed.dom.getParent(element, function(p) {
					return tinymce.inArray(indented, p) != -1;
				});
				if (!indentedParent) {
					var wrapList = createWrapList(element);
					wrapList.appendChild(element);
					indented.push(element);
				}
			}
			
			function processList(element) {
					each(element.childNodes, indentLI);
					indented.push(element);
			}
			
			function defaultAction(element) {
				var currentIndent = parseInt(ed.dom.getStyle(element, 'padding-left') || 0);
				ed.dom.setStyle(element, 'padding-left', (currentIndent + indentAmount) + indentUnits);
			}
			
			this.process({
				'LI': indentLI,
				'OL': processList,
				'UL': processList,
				defaultAction: defaultAction
			});
			
		},
		
		outdent: function() {
			var ed = this.ed, dom = ed.dom, indentAmount, indentUnits, outdented = [], newIndentAmount;
			
			indentAmount = ed.settings.indentation;
			indentUnits = /[a-z%]+/i.exec(indentAmount);
			indentAmount = parseInt(indentAmount);
			
			function outdentLI(element) {
				var outdentedParent = ed.dom.getParent(element, function(p) {
					return tinymce.inArray(outdented, p) != -1;
				});
				if (!outdentedParent) {
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
			
			function defaultAction(element) {
				var currentIndent = parseInt(ed.dom.getStyle(element, 'padding-left') || 0);
				var newIndentAmount = currentIndent - indentAmount;
				ed.dom.setStyle(element, 'padding-left', newIndentAmount > 0 ? newIndentAmount + indentUnits : '');
			}
			
			this.process({
				'LI': outdentLI,
				'OL': processList,
				'UL': processList,
				defaultAction: defaultAction
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