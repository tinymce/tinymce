/**
 * editor_plugin_src.js
 *
 * Copyright 2011, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
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
		var t = this;

		// Internet Explorer has built-in automatic linking
		if (tinyMCE.isIE)
			return;

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
			var r, end, start, endContainer, bookmark, text, matches, prev, len;

			// We need at least five characters to form a URL,
			// hence, at minimum, five characters from the beginning of the line.
			r = ed.selection.getRng().cloneRange();
			if (r.startOffset < 5) {
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
			} else {
				endContainer = r.endContainer;

				// Get a text node
				if (endContainer.nodeType != 3 && endContainer.firstChild) {
					while (endContainer.nodeType != 3 && endContainer.firstChild)
						endContainer = endContainer.firstChild;

					r.setStart(endContainer, 0);
					r.setEnd(endContainer, endContainer.nodeValue.length);
				}

				if (r.endOffset == 1)
					end = 2;
				else
					end = r.endOffset - 1 - end_offset;
			}

			start = end;

			do
			{
				// Move the selection one character backwards.
				r.setStart(endContainer, end - 2);
				r.setEnd(endContainer, end - 1);
				end -= 1;

				// Loop until one of the following is found: a blank space, &nbsp;, delimeter, (end-2) >= 0
			} while (r.toString() != ' ' && r.toString() != '' && r.toString().charCodeAt(0) != 160 && (end -2) >= 0 && r.toString() != delimiter);

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

			if (matches) {
				if (matches[1] == 'www.') {
					matches[1] = 'http://www.';
				}

				bookmark = ed.selection.getBookmark();

				ed.selection.setRng(r);
				tinyMCE.execCommand('mceInsertLink',false, matches[1] + matches[2]);
				ed.selection.moveToBookmark(bookmark);

				// TODO: Determine if this is still needed.
				if (tinyMCE.isWebKit) {
					// move the caret to its original position
					ed.selection.collapse(false);
					var max = Math.min(endContainer.length, start + 1);
					r.setStart(endContainer, max);
					r.setEnd(endContainer, max);
					ed.selection.setRng(r);
				}
			}
		},

		/**
		* Returns information about the plugin as a name/value array.
		* The current keys are longname, author, authorurl, infourl and version.
		*
		* @return {Object} Name/value array containing information about the plugin.
		*/
		getInfo : function() {
			return {
				longname : 'Autolink',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/autolink',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('autolink', tinymce.plugins.AutolinkPlugin);
})();
