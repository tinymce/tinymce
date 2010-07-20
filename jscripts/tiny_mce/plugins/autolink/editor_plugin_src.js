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
            // Internet Explorer has built-in automatic linking
            if (tinyMCE.isIE)
                return;

            // Add a node change handler
			ed.onKeyUp.add(function(ed, e) {
                var r, end, start, endContainer, bookmark, text, matches, prev, len;

                if (e.keyCode != 32)
                    return;

                // We need atleast five characters to form a URL,
                // hence, at minimum, five characters from the beginning of the line.
                r = ed.selection.getRng();
                if (r.startOffset < 5)
                {
                    // During testing, the caret is placed inbetween two text nodes. 
                    // The previous text node contains the URL.
                    prev = r.endContainer.previousSibling;
                    len = r.endContainer.previousSibling.length;
                    r.setStart(prev, len);
                    r.setEnd(prev, len);

                    if (r.endOffset < 5)
                        return;

                    end = r.endOffset;
                }
                else
                    end = r.endOffset - 1;

                start = end;
                endContainer = r.endContainer;
                bookmark = ed.selection.getBookmark();

                do
                {
                    // Move the selection one character backwards.
                    r.setStart(endContainer, end - 2);
                    r.setEnd(endContainer, end - 1);
                    end -= 1;
                } while (r.toString() != ' ' && r.toString() != '' && (end -2) >= 0)

                if (r.startOffset == 0) {
                    r.setStart(endContainer, 0);
                    r.setEnd(endContainer, start);
                }
                else {
                    r.setStart(endContainer, end);
                    r.setEnd(endContainer, start);
                }

                text = r.toString();
                matches = text.match(/^(https?:\/\/|ssh:\/\/|ftp:\/\/|file:\/|www\.)(.+)$/i);
                if (matches) {
                    if (matches[1] == 'www.') {
                        matches[1] = 'http://www.';
                    }
                    var bookmark = ed.selection.getBookmark();
                    ed.selection.setRng(r);
                    tinyMCE.execCommand('mceInsertLink',false, matches[1] + matches[2]);
                    
                    ed.selection.moveToBookmark(bookmark);
                } else {
                    // move the caret to its original position
                    ed.selection.collapse(false);
                    r.setStart(endContainer, start + 1);
                    r.setEnd(endContainer, start + 1);
                    ed.selection.setRng(r);
                }
            });
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
                author : 'Ephox Corporation',
                authorurl : 'http://tinymce.ephox.com',
                infourl : 'http://tinymce.ephox.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion,
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('autolink', tinymce.plugins.AutolinkPlugin);
})();