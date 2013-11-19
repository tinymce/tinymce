/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('pagebreak', function(editor) {
	var cls = 'mce-pagebreak', sep = editor.getParam('pagebreak_separator', '<!-- pagebreak -->'), pbRE;
	var pb = '<img src="' + tinymce.Env.transparentSrc + '" class="' + cls + '" data-mce-resize="false" />';

	pbRE = new RegExp(sep.replace(/[\?\.\*\[\]\(\)\{\}\+\^\$\:]/g, function(a) {
		return '\\' + a;
	}), 'gi');

	// Register commands
	editor.addCommand('mcePageBreak', function() {
		var generateCode = function(pb, current){
			var parent = current && current.parentNode || editor.selection.getNode();
			var parentNode = parent.nodeName.toLowerCase();
			
			if (parentNode == 'body'){
				return pb;
			}else{
				pb = generateCode(pb, parent);
				var attrs = ' ';
				var attributes = parent.attributes;
				
				for (var i=0; i < attributes.length; i++){
					var item = attributes.item(i);
					attrs = attrs + item.nodeName.toLowerCase() + '="' + item.nodeValue + '" ';
				}
				pb = '</' + parentNode + '>' + pb + '<' + parentNode + attrs + '>';
				
				return pb;
			}
		};
		
		editor.execCommand('mceInsertRawHTML', 0, generateCode(pb));
	});

	// Register buttons
	editor.addButton('pagebreak', {
		title: 'Page break',
		cmd: 'mcePageBreak'
	});

	editor.addMenuItem('pagebreak', {
		text: 'Page break',
		icon: 'pagebreak',
		cmd: 'mcePageBreak',
		context: 'insert'
	});

	editor.on('ResolveName', function(e) {
		if (e.target.nodeName == 'IMG' && editor.dom.hasClass(e.target, cls)) {
			e.name = 'pagebreak';
		}
	});

	editor.on('click', function(e) {
		e = e.target;

		if (e.nodeName === 'IMG' && editor.dom.hasClass(e, cls)) {
			editor.selection.select(e);
		}
	});

	editor.on('BeforeSetContent', function(e) {
		e.content = e.content.replace(pbRE, pb);
	});

	editor.on('PreInit', function() {
		editor.serializer.addNodeFilter('img', function(nodes) {
			var i = nodes.length, node, className;

			while (i--) {
				node = nodes[i];
				className = node.attr('class');
				if (className && className.indexOf('mce-pagebreak') !== -1) {
					node.type = 3;
					node.value = sep;
					node.raw = true;
				}
			}
		});
	});
});
