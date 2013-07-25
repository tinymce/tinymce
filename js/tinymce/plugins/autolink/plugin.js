/**
 * plugin.js
 *
 * Copyright 2011, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('autolink', function(editor) {
	editor.on("keydown", function(e) {
		if (e.keyCode == 13) {
			return handleEnter(editor);
		}
	});

	// Internet Explorer has built-in automatic linking for most cases
	if (tinymce.Env.ie) {
		return;
	}

	editor.on("keypress", function(e) {
		if (e.which == 41) {
			return handleEclipse(editor);
		}
	});

	editor.on("keyup", function(e) {
		if (e.keyCode == 32) {
			return handleSpacebar(editor);
		}
	});

	function handleEclipse(editor) {
		parseCurrentLine(editor, -1, '(', true);
	}

	function handleSpacebar(editor) {
		parseCurrentLine(editor, 0, '', true);
	}

	function handleEnter(editor) {
		parseCurrentLine(editor, -1, '', false);
	}

	function parseCurrentLine(editor, end_offset, delimiter) {
		var rng, end, start, endContainer, bookmark, text, matches, prev, len;

		// We need at least five characters to form a URL,
		// hence, at minimum, five characters from the beginning of the line.
		rng = editor.selection.getRng(true).cloneRange();
		if (rng.startOffset < 5) {
			// During testing, the caret is placed inbetween two text nodes.
			// The previous text node contains the URL.
			prev = rng.endContainer.previousSibling;
			if (!prev) {
				if (!rng.endContainer.firstChild || !rng.endContainer.firstChild.nextSibling) {
					return;
				}

				prev = rng.endContainer.firstChild.nextSibling;
			}

			len = prev.length;
			rng.setStart(prev, len);
			rng.setEnd(prev, len);

			if (rng.endOffset < 5) {
				return;
			}

			end = rng.endOffset;
			endContainer = prev;
		} else {
			endContainer = rng.endContainer;

			// Get a text node
			if (endContainer.nodeType != 3 && endContainer.firstChild) {
				while (endContainer.nodeType != 3 && endContainer.firstChild) {
					endContainer = endContainer.firstChild;
				}

				// Move range to text node
				if (endContainer.nodeType == 3) {
					rng.setStart(endContainer, 0);
					rng.setEnd(endContainer, endContainer.nodeValue.length);
				}
			}

			if (rng.endOffset == 1) {
				end = 2;
			} else {
				end = rng.endOffset - 1 - end_offset;
			}
		}

		start = end;

		do {
			// Move the selection one character backwards.
			rng.setStart(endContainer, end >= 2 ? end - 2 : 0);
			rng.setEnd(endContainer, end >= 1 ? end - 1 : 0);
			end -= 1;

			// Loop until one of the following is found: a blank space, &nbsp;, delimiter, (end-2) >= 0
		} while (rng.toString() != ' ' && rng.toString() !== '' &&
			rng.toString().charCodeAt(0) != 160 && (end -2) >= 0 && rng.toString() != delimiter);

		if (rng.toString() == delimiter || rng.toString().charCodeAt(0) == 160) {
			rng.setStart(endContainer, end);
			rng.setEnd(endContainer, start);
			end += 1;
		} else if (rng.startOffset === 0) {
			rng.setStart(endContainer, 0);
			rng.setEnd(endContainer, start);
		}
		else {
			rng.setStart(endContainer, end);
			rng.setEnd(endContainer, start);
		}

		// Exclude last . from word like "www.site.com."
		text = rng.toString();
		if (text.charAt(text.length - 1) == '.') {
			rng.setEnd(endContainer, start - 1);
		}

		text = rng.toString();
		matches = text.match(/^(https?:\/\/|ssh:\/\/|ftp:\/\/|file:\/|www\.|(?:mailto:)?[A-Z0-9._%+\-]+@)(.+)$/i);

		if (matches) {
			if (matches[1] == 'www.') {
				matches[1] = 'http://www.';
			} else if (/@$/.test(matches[1]) && !/^mailto:/.test(matches[1])) {
				matches[1] = 'mailto:' + matches[1];
			}

			bookmark = editor.selection.getBookmark();

			editor.selection.setRng(rng);
			editor.execCommand('createlink', false, matches[1] + matches[2]);
			editor.selection.moveToBookmark(bookmark);
			editor.nodeChanged();

			// TODO: Determine if this is still needed.
			if (tinymce.Env.webkit) {
				// move the caret to its original position
				editor.selection.collapse(false);
				var max = Math.min(endContainer.length, start + 1);
				rng.setStart(endContainer, max);
				rng.setEnd(endContainer, max);
				editor.selection.setRng(rng);
			}
		}
	}
});
