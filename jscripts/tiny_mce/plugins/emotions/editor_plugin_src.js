/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	tinymce.create('tinymce.plugins.EmotionsPlugin', {
		EmotionsPlugin : function(ed, url) {
			// Register commands
			ed.addCommand('mceEmotion', function() {
				ed.windowManager.open({
					file : url + '/emotions.htm',
					width : 250 + ed.getLang('emotions.delta_width', 0),
					height : 160 + ed.getLang('emotions.delta_height', 0),
					inline : 1
				}, {
					plugin_url : url
				});
			});

			// Register buttons
			ed.addButton('emotions', {title : 'emotions.emotions_desc', cmd : 'mceEmotion'});
		},

		getInfo : function() {
			return {
				longname : 'Emotions',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/emotions',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('emotions', tinymce.plugins.EmotionsPlugin);
})();