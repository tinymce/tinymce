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

tinymce.PluginManager.add('anchor', function(editor) {
	function showDialog() {
		var selectedNode = editor.selection.getNode();
		
		if (editor.selection.isCollapsed()) {
            		var selRng = editor.selection.getRng();
            		selRng.expand("word"); //expands the DOM range to the current word
            		editor.selection.setRng(selRng);
        	}
        
	    	var selectedText = editor.selection.getContent({ format: 'text' });
	    	var anchorElm = editor.dom.getParent(selectedNode, 'a:not([href])');

		editor.windowManager.open({
			title: 'Anchor',
			body: {type: 'textbox', name: 'name', size: 40, label: 'Name', value: selectedText || selectedNode.name || selectedNode.id},
			buttons: [
				{
				    text: "Save", onclick: function () {
				        win.find('form')[0].submit();
				    }
				},
				{
				    text: "Delete", disabled: anchorElm ? false : true, onclick: function () {
				        editor.dom.remove(anchorElm);
				        editor.windowManager.close();
				        editor.undoManager.add();
				    }
				},
				{
				    text: "Cancel", onclick: function () {
				        editor.windowManager.close();
				    }
				}
			],
			onsubmit: function(e) {
				editor.execCommand('mceInsertContent', false, editor.dom.createHTML('a', {
					id: e.data.name
				}));
			    	editor.undoManager.add();
			}
		});
	}

	editor.addButton('anchor', {
		icon: 'anchor',
		tooltip: 'Anchor',
		onclick: showDialog,
		stateSelector: 'a:not([href])'
	});
	
	this.showDialog = showDialog;

	editor.addMenuItem('anchor', {
		icon: 'anchor',
		text: 'Anchor',
		context: 'insert',
		onclick: showDialog
	});
});
