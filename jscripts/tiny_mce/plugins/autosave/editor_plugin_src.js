/**
 * $Id: editor_plugin_src.js 5 2006-06-05 19:51:22Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

/* Import plugin specific language pack */
tinyMCE.importPluginLanguagePack('autosave', 'en,tr,sv,cs,he,nb,hu,de,da,ru,ru_KOI8-R,ru_UTF-8,nn,fi,cy,es,is,pl,pt_br');

var TinyMCE_AutoSavePlugin = {
	getInfo : function() {
		return {
			longname : 'Auto save',
			author : 'Moxiecode Systems',
			authorurl : 'http://tinymce.moxiecode.com',
			infourl : 'http://tinymce.moxiecode.com/tinymce/docs/plugin_autosave.html',
			version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
		};
	},

	// Private plugin internal methods

	_beforeUnloadHandler : function() {
		var n, inst, anyDirty = false, msg = tinyMCE.getLang("lang_autosave_unload_msg");

		if (tinyMCE.getParam("fullscreen_is_enabled"))
			return;

		for (n in tinyMCE.instances) {
			inst = tinyMCE.instances[n];

			if (!tinyMCE.isInstance(inst))
				continue;

			if (inst.isDirty())
				return msg;
		}

		return;
	}
};

window.onbeforeunload = TinyMCE_AutoSavePlugin._beforeUnloadHandler;

tinyMCE.addPlugin("autosave", TinyMCE_AutoSavePlugin);
