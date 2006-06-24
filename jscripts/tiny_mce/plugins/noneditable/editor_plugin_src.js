/**
 * $Id: editor_plugin_src.js 5 2006-06-05 19:51:22Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

var TinyMCE_NonEditablePlugin = {
	getInfo : function() {
		return {
			longname : 'Non editable elements',
			author : 'Moxiecode Systems',
			authorurl : 'http://tinymce.moxiecode.com',
			infourl : 'http://tinymce.moxiecode.com/tinymce/docs/plugin_noneditable.html',
			version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
		};
	},

	initInstance : function(inst) {
		tinyMCE.importCSS(inst.getDoc(), tinyMCE.baseURL + "/plugins/noneditable/css/noneditable.css");

		// Ugly hack
		if (tinyMCE.isMSIE5_0)
			tinyMCE.settings['plugins'] = tinyMCE.settings['plugins'].replace(/noneditable/gi, 'Noneditable');

		if (tinyMCE.isGecko) {
			tinyMCE.addEvent(inst.getDoc(), "keyup", TinyMCE_NonEditablePlugin._fixKeyUp);
	//		tinyMCE.addEvent(inst.getDoc(), "keypress", TinyMCE_NonEditablePlugin._selectAll);
	//		tinyMCE.addEvent(inst.getDoc(), "mouseup", TinyMCE_NonEditablePlugin._selectAll);
		}
	},

	cleanup : function(type, content, inst) {
		switch (type) {
			case "insert_to_editor_dom":
				var nodes = tinyMCE.getNodeTree(content, new Array(), 1);
				var editClass = tinyMCE.getParam("noneditable_editable_class", "mceEditable");
				var nonEditClass = tinyMCE.getParam("noneditable_noneditable_class", "mceNonEditable");

				for (var i=0; i<nodes.length; i++) {
					var elm = nodes[i];

					// Convert contenteditable to classes
					var editable = tinyMCE.getAttrib(elm, "contenteditable");
					if (new RegExp("true|false","gi").test(editable))
						TinyMCE_NonEditablePlugin._setEditable(elm, editable == "true");

					if (tinyMCE.isMSIE) {
						var className = elm.className ? elm.className : "";

						if (className.indexOf(editClass) != -1)
							elm.contentEditable = true;

						if (className.indexOf(nonEditClass) != -1)
							elm.contentEditable = false;
					}
				}

				break;

			case "insert_to_editor":
				if (tinyMCE.isMSIE) {
					var editClass = tinyMCE.getParam("noneditable_editable_class", "mceEditable");
					var nonEditClass = tinyMCE.getParam("noneditable_noneditable_class", "mceNonEditable");

					content = content.replace(new RegExp("class=\"(.*)(" + editClass + ")([^\"]*)\"", "gi"), 'class="$1$2$3" contenteditable="true"');
					content = content.replace(new RegExp("class=\"(.*)(" + nonEditClass + ")([^\"]*)\"", "gi"), 'class="$1$2$3" contenteditable="false"');
				}

				break;

			case "get_from_editor_dom":
				if (tinyMCE.getParam("noneditable_leave_contenteditable", false)) {
					var nodes = tinyMCE.getNodeTree(content, new Array(), 1);

					for (var i=0; i<nodes.length; i++)
						nodes[i].removeAttribute("contenteditable");
				}

				break;
		}

		return content;
	},

	// Private internal plugin methods

	_fixKeyUp : function(e) {
		var inst = tinyMCE.selectedInstance;
		var sel = inst.getSel();
		var rng = inst.getRng();
		var an = sel.anchorNode;

		// Move cursor outside non editable fields
		if ((e.keyCode == 38 || e.keyCode == 37 || e.keyCode == 40 || e.keyCode == 39) && (elm = TinyMCE_NonEditablePlugin._isNonEditable(an)) != null) {
			rng = inst.getDoc().createRange();
			rng.selectNode(elm);
			rng.collapse(true);
			sel.removeAllRanges();
			sel.addRange(rng);
			tinyMCE.cancelEvent(e);
		}
	},
/*
	_selectAll : function(e) {
		var inst = tinyMCE.selectedInstance;
		var sel = inst.getSel();
		var doc = inst.getDoc();

		if ((elm = TinyMCE_NonEditablePlugin._isNonEditable(sel.focusNode)) != null) {
			inst.selection.selectNode(elm, false);
			tinyMCE.cancelEvent(e);
			return;
		}

		if ((elm = TinyMCE_NonEditablePlugin._isNonEditable(sel.anchorNode)) != null) {
			inst.selection.selectNode(elm, false);
			tinyMCE.cancelEvent(e);
			return;
		}
	},*/

	_isNonEditable : function(elm) {
		var editClass = tinyMCE.getParam("noneditable_editable_class", "mceEditable");
		var nonEditClass = tinyMCE.getParam("noneditable_noneditable_class", "mceNonEditable");

		if (!elm)
			return;

		do {
			var className = elm.className ? elm.className : "";

			if (className.indexOf(editClass) != -1)
				return null;

			if (className.indexOf(nonEditClass) != -1)
				return elm;
		} while (elm = elm.parentNode);

		return null;
	},

	_setEditable : function(elm, state) {
		var editClass = tinyMCE.getParam("noneditable_editable_class", "mceEditable");
		var nonEditClass = tinyMCE.getParam("noneditable_noneditable_class", "mceNonEditable");

		var className = elm.className ? elm.className : "";

		if (className.indexOf(editClass) != -1 || className.indexOf(nonEditClass) != -1)
			return;

		if ((className = tinyMCE.getAttrib(elm, "class")) != "")
			className += " ";

		className += state ? editClass : nonEditClass;

		elm.setAttribute("class", className);
		elm.className = className;
	}
};

tinyMCE.addPlugin("noneditable", TinyMCE_NonEditablePlugin);
