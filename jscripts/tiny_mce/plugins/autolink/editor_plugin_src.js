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

        //var _triggerCharacters = { ' ', '\n', '\r', ')', };

		init : function(ed, url) {
			// Add a node change handler
			ed.onKeyUp.add(function(ed, e) {
                if (e.keyCode == 13) {
/*
                    var a = ed.selection.getNode();
                    var b = a.previousSibling;
                    ed.selection.select(b);
                    ed.selection.collapse(true);
                    var r = ed.selection.getRng();
*/
                }
                else { 
                    var end = ed.selection.getRng().endOffset;
                    while (ed.selection.getContent({format : 'text'}) != ' ' && ed.selection.getRng().startOffset > 0) 
                    {
                        alert(ed.selection.getContent({format : 'text'}));

                        var r = ed.dom.createRng();
                        r.setStart(ed.selection.getNode(), end - 1);
                        r.setEnd(ed.selection.getNode(), end);
                        ed.selection.setRng(r);
                        end -= 1;
                    }
                }

                tinyMCE.execCommand('mceInsertContent',false,'H');
/*
                if (this.isTriggerCharacter(e.keyCode)) {
                    this.checkForUrlsToConvert();
                }
*/
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

        checkForUrlsToConvert : function() {
            var linkText = getMostLikelyLinkText();
            var endOffset = _pane.getCaretPosition();
            applyHyperlink(endOffset - linkText.length(), endOffset, uri.toURL().toString());
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