/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('formatpainter', function(p_editor, p_url) {
	var gv_Format = null;
	var v_copyButton = null;

	function copyFormat() {
		v_copyButton.active(true);
		document.getElementById(v_copyButton._id).classList.add('mce-active-orange');

		var v_startDom = tinymce.dom.DomQuery(p_editor.selection.getStart());
		var v_endDom = tinymce.dom.DomQuery(p_editor.selection.getEnd());

		if(v_startDom == null || v_endDom == null || v_startDom.html() != v_endDom.html()) {//must start and end in the same "format"
			gv_Format = null;
			v_copyButton.active(false);
			document.getElementById(v_copyButton._id).classList.remove('mce-active-orange');
			return;
		}

		var v_node = tinymce.dom.DomQuery(p_editor.selection.getNode());

		var v_html = v_node[0].outerHTML.replace(v_node[0].innerHTML, '');//Throws trash away from selected node html
		var v_nextParent = v_node.parent();

		while(!v_nextParent[0].classList.contains('mce-content-body')) {//Just get parents inside tinymce container
			v_html += v_nextParent[0].outerHTML.replace(v_nextParent[0].innerHTML, '');//Throws trash away from parent node html
			v_nextParent = v_nextParent.parent();
		}

		var v_openTagList = v_html.match(/<\s*\w.*?>/g);

		if(v_openTagList == null) {
			gv_Format = null;
			v_copyButton.active(false);
			document.getElementById(v_copyButton._id).classList.remove('mce-active-orange');
			return;
		}

		var v_openTags = '';

		for(var i = 0; i < v_openTagList.length - 1; i++) {//Open tags inserted in correct order inside of v_html. Discards last one, that could be <div>, <p>, etc.
			v_openTags += v_openTagList[i];
		}

		var v_closeTagList = v_html.match(/<\s*\/\s*\w\s*.*?>|<\s*br\s*>/g);

		if(v_closeTagList == null) {
			gv_Format = null;
			v_copyButton.active(false);
			document.getElementById(v_copyButton._id).classList.remove('mce-active-orange');
			return;
		}

		var v_closeTags = '';

		for(var i = length - 1; i > 0; i--) {//Close tags inserted in incorrect order inside of v_html. Discards first one, that could be </div>, </p>, etc.
			v_closeTags += v_closeTagList[i];
		}

		gv_Format = {
			openTags: v_openTags,
			closeTags: v_closeTags
		}
	}

	function pasteFormat() {
		v_copyButton.active(false);
		document.getElementById(v_copyButton._id).classList.remove('mce-active-orange');

		if(gv_Format == null) {
			return;
		}

		tinymce.execCommand('RemoveFormat');
		tinymce.activeEditor.selection.setContent(gv_Format.openTags + p_editor.selection.getContent() + gv_Format.closeTags);

		gv_Format = null;
	}

	p_editor.on('init', function() {
		p_editor.addShortcut('Ctrl+Shift+C', '', copyFormat);
		p_editor.addShortcut('Ctrl+Shift+V', '', pasteFormat);

		var v_cssURL = p_url + '/css/formatpainter.css';

        if(document.createStyleSheet) {
            document.createStyleSheet(v_cssURL);
        }
        else {
            v_cssLink = p_editor.dom.create('link', {
                        rel: 'stylesheet',
                        href: v_cssURL
            });

            document.getElementsByTagName('head')[0].appendChild(v_cssLink);
        }
	});

	p_editor.addCommand('copyFormat', copyFormat);
	p_editor.addCommand('pasteFormat', pasteFormat);

	p_editor.addMenuItem('copyformat', {
		text: 'Copy Format',
		shortcut: 'Ctrl+Shift+C',
		selectable: true,
		onClick: function() {
			copyFormat();
		},
		context: 'format'
	});

	p_editor.addMenuItem('pasteformat', {
		text: 'Paste Format',
		shortcut: 'Ctrl+Shift+V',
		selectable: true,
		onClick: function() {
			pasteFormat();
		},
		context: 'format'
	});

	p_editor.addButton('copyformat', {
		icon: 'paint-brush',
		text: 'Copy',
		tooltip: 'Format Painter',
		shortcut: 'Ctrl+Shift+C',
		onClick: function () {
			v_copyButton = this;
			copyFormat();
		}
	});

	p_editor.addButton('pasteformat', {
		icon: 'paint-brush',
		text: 'Paste', 
		tooltip: 'Format Painter',
		shortcut: 'Ctrl+Shift+V',
		onClick: function () {
			pasteFormat() ;
		}
	});
});

