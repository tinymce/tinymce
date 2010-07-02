(function() {
	var each = tinymce.each;
	tinymce.create('tinymce.ephox.plugins.Lists', {
		init: function(ed, url) {
			this.ed = ed;
			ed.addCommand('Indent', this.indent, this);
		},
		
		indent: function() {
			var ed = this.ed;
			var indentAmount, indentUnits;
			
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
			
			var indented = [];
			var bookmark = ed.selection.getBookmark();
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
			each(ed.selection.getSelectedBlocks(), function(element) {
				if ('LI' == element.tagName) {
					indentLI(element);
				} else if (ed.dom.is(element, 'ul,ol')) {
					each(element.childNodes, indentLI);
					indented.push(element);
				} else {
					var currentIndent = parseInt(ed.dom.getStyle(element, 'padding-left') || 0);
					ed.dom.setStyle(element, 'padding-left', (currentIndent + indentAmount) + indentUnits);
				}
			});
			ed.selection.moveToBookmark(bookmark);
		},
		
		
		
		getInfo : function() {
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