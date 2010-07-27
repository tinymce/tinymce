/**
 * editor_plugin_src.js
 *
 * Copyright 2010, Ephox * Released under TODO
 *
 * License: TODO
 *
 * BUGS:
 *   
 *
 *
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

            var t = this;

            // Add a key down handler
			ed.onKeyDown.add(function(ed, e) {
                if (e.keyCode == 13)
                    return t.handleEnter(ed);
                if (e.shiftKey && e.keyCode == 48)
                    return t.handleEclipse(ed);
            });
            
            // Add a key up handler
			ed.onKeyUp.add(function(ed, e) {
                if (e.keyCode == 32)
                    return t.handleSpacebar(ed);
            });
		},

        handleEclipse : function(ed) {
            this.parseCurrentLine(ed, -1, '(', true);
        },
        handleSpacebar : function(ed) {
            this.parseCurrentLine(ed, 0, '', true);
        },
        handleEnter : function(ed) {
            this.parseCurrentLine(ed, -1, '', false);
        },

        parseCurrentLine : function(ed, end_offset, delimiter, goback) {
            var r, end, start, endContainer, bookmark1, bookmark2, text, matches, prev, len;

            // We need atleast five characters to form a URL,
            // hence, at minimum, five characters from the beginning of the line.
            r = ed.selection.getRng();
            if (r.startOffset < 5)
            {
                // During testing, the caret is placed inbetween two text nodes. 
                // The previous text node contains the URL.
                prev = r.endContainer.previousSibling;
                if (prev == null) {
                    if (r.endContainer.firstChild == null || r.endContainer.firstChild.nextSibling == null)
                        return;

                    prev = r.endContainer.firstChild.nextSibling;
                }
                len = prev.length;
                r.setStart(prev, len);
                r.setEnd(prev, len);

                if (r.endOffset < 5)
                    return;

                end = r.endOffset;
                endContainer = prev;
            }
            else
            {
                end = r.endOffset - 1 - end_offset;
                endContainer = r.endContainer;
            }

            start = end;
            bookmark1 = ed.selection.getBookmark();

            do
            {
                // Move the selection one character backwards.
                r.setStart(endContainer, end - 2);
                r.setEnd(endContainer, end - 1);
                end -= 1;

                // Loop until one of the following is found: a blank space, &nbsp;, delimeter, (end-2) >= 0
            } while (r.toString() != ' ' && r.toString() != '' && r.toString().charCodeAt(0) != 160 && (end -2) >= 0 && r.toString() != delimiter)

            if (r.toString() == delimiter || r.toString().charCodeAt(0) == 160) {
                r.setStart(endContainer, end);
                r.setEnd(endContainer, start);
                end += 1;
            } else if (r.startOffset == 0) {
                r.setStart(endContainer, 0);
                r.setEnd(endContainer, start);
            }
            else {
                r.setStart(endContainer, end);
                r.setEnd(endContainer, start);
            }

            text = r.toString();
            matches = text.match(/^(https?:\/\/|ssh:\/\/|ftp:\/\/|file:\/|www\.)(.+)$/i);
            bookmark2 = ed.selection.getBookmark();

            if (matches) {
                if (matches[1] == 'www.') {
                    matches[1] = 'http://www.';
                }

                ed.selection.setRng(r);
                tinyMCE.execCommand('mceInsertLink',false, matches[1] + matches[2]);
                ed.selection.moveToBookmark(bookmark2);

                // delete the bookmarks
                ed.dom.remove(bookmark1.id);
                ed.dom.remove(bookmark2.id);
                var id = parseInt(ed.dom.uniqueId().substring(4));
                ed.dom.remove('mce_' + (id-1) + '_start');
                ed.dom.remove('mce_' + (id-2) + '_start');

                if (tinyMCE.isWebKit) {
                    // move the caret to its original position
                    ed.selection.collapse(false);
                    var max = Math.min(endContainer.length, start + 1);
                    r.setStart(endContainer, max);
                    r.setEnd(endContainer, max);
                    ed.selection.setRng(r);
                }
            }
            else {
                // delete the bookmarks
                ed.dom.remove(bookmark1.id);
                ed.dom.remove(bookmark2.id);
                if (!tinyMCE.isWebKit) {
                    var id = parseInt(ed.dom.uniqueId().substring(4));
                    ed.dom.remove('mce_' + (id-1) + '_start');
                    ed.dom.remove('mce_' + (id-2) + '_start');
                }

                // do not move the caret to its original position
                if (!goback)
                    return;

                // move the caret to its original position
                ed.selection.collapse(false);
                var max = Math.min(endContainer.length, start + 1);
                r.setStart(endContainer, max);
                r.setEnd(endContainer, max);
                ed.selection.setRng(r);
            }
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