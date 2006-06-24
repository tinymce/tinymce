/**
 * $Id: editor_plugin_src.js 5 2006-06-05 19:51:22Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

/* Import theme	specific language pack */
tinyMCE.importPluginLanguagePack('print', 'en,tr,sv,zh_cn,fa,fr_ca,fr,de,pl,pt_br,cs,nl,da,he,nb,hu,ru,ru_KOI8-R,ru_UTF-8,nn,fi,es,cy,is,zh_tw,zh_tw_utf8,sk');

var TinyMCE_PrintPlugin = {
	getInfo : function() {
		return {
			longname : 'Print',
			author : 'Moxiecode Systems',
			authorurl : 'http://tinymce.moxiecode.com',
			infourl : 'http://tinymce.moxiecode.com/tinymce/docs/plugin_print.html',
			version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
		};
	},

	getControlHTML : function(cn)	{
		switch (cn) {
			case "print":
				return tinyMCE.getButtonHTML(cn, 'lang_print_desc', '{$pluginurl}/images/print.gif', 'mcePrint');
		}

		return "";
	},

	/**
	 * Executes	the	search/replace commands.
	 */
	execCommand : function(editor_id, element, command,	user_interface,	value) {
		// Handle commands
		switch (command) {
			case "mcePrint":
				tinyMCE.getInstanceById(editor_id).contentWindow.print();
				return true;
		}

		// Pass to next handler in chain
		return false;
	}
};

tinyMCE.addPlugin("print", TinyMCE_PrintPlugin);
