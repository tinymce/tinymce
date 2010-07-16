/**
 * editor_plugin_src.js
 *
 * Copyright 2010, Ephox * Released under TODO
 *
 * License: TODO
 */

(function() {
	tinymce.create('tinymce.plugins.AutolinkPlugin', {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */

		init : function(ed, url) {
			// Add a node change handler
			ed.onKeyUp.add(function(ed, e) {
                switch(e.keyCode) {
                    case 13: // \n character
/*
                        var a = ed.selection.getNode();
                        var b = a.previousSibling;
                        ed.selection.select(b);
                        ed.selection.collapse(true);
                        var r = ed.selection.getRng();
*/
                
                    case 32:  // space character
                        var end = start = ed.selection.getRng().endOffset -1;
                        do
                        {
                            var j = ed.selection.getNode();
                            var rng = ed.selection.getRng();

                            var r = ed.dom.createRng();
                            r.setStart(rng.endContainer, end - 2);
                            r.setEnd(rng.endContainer, end - 1);
                            ed.selection.setRng(r);
                            end -= 1;
                        } while (ed.selection.getContent({format : 'text'}) != ' ' && 
                                 ed.selection.getContent({format : 'text'}) != '' && (ed.selection.getRng().startOffset -1) >= 0)

                        if (ed.selection.getRng().startOffset == 0) {
                            var r = ed.dom.createRng();
                            r.setStart(rng.endContainer, 0)
                            r.setEnd(rng.endContainer, start);
                            ed.selection.setRng(r);
                        }
                        else {
                            var r = ed.dom.createRng();
                            r.setStart(rng.endContainer, end);
                            r.setEnd(rng.endContainer, start);
                            ed.selection.setRng(r);
                        }

                        break;

                    default:
                        return;
                }

                var text = ed.selection.getContent({format : 'text'});
                var matches = text.match(/^(https?:\/\/|ftp:\/\/|file:\/|www\.)(.+)$/i);
                if (matches)
                    tinyMCE.execCommand('mceInsertLink',false, matches[1] + matches[2]);

                // return caret to previous location
			});
		},

        isTriggerCharacter : function(keyCode) {
            var isTriggerCharacter = false;
            for (var i = 0; i < _triggerCharacters.length; i++) {
                if (keyCode == _triggerCharacters[i]) {
                    isTriggerCharacter = true;
                    break;
                }
            }
            return isTriggerCharacter;
        },

		/**
		 * Creates control instances based in the incomming name. This method is normally not
		 * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
		 * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
		 * method can be used to create those.
		 *
		 * @param {String} n Name of the control to create.
		 * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
		 * @return {tinymce.ui.Control} New control instance or null if no control was created.
		 */
		createControl : function(n, cm) {
			return null;
		},

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'Autolink plugin',
				author : 'Ephox - Yonas Yanfa',
				authorurl : 'http://www.ephox.com',
				infourl : 'http://www.ephox.com',
				version : "1.0"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('autolink', tinymce.plugins.AutolinkPlugin);
})();