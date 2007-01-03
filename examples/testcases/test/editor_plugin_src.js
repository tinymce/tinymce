/**
 * $RCSfile: editor_plugin_src.js,v $
 * $Revision: 1.1 $
 * $Date: 2006/03/03 16:10:53 $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

tinyMCE.importPluginLanguagePack('test');

var TinyMCE_TestPlugin = {
	getInfo : function() {
		return {
			longname : 'Test plugin',
			author : 'Your name',
			authorurl : 'http://www.yoursite.com',
			infourl : 'http://www.yoursite.com/docs/template.html',
			version : "1.0"
		};
	},

	initInstance : function(inst) {
	},

	getControlHTML : function(cn) {
		switch (cn) {
			case "test":
				return tinyMCE.getButtonHTML(cn, 'lang_test_desc', '{$pluginurl}/images/test.gif', 'mceTest', true);
		}

		return "";
	},

	execCommand : function(editor_id, element, command, user_interface, value) {
		switch (command) {
			case "mceTest":
				alert('Test');
				return true;
		}

		return false;
	}
};

tinyMCE.addPlugin("test", TinyMCE_TestPlugin);
