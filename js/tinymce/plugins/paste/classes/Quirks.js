/**
 * Quirks.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains various fixes for browsers. These issues can not be feature
 * detected since we have no direct control over the clipboard. However we might be able
 * to remove some of these fixes once the browsers gets updated/fixed.
 *
 * @class tinymce.pasteplugin.Quirks
 * @private
 */
define("tinymce/pasteplugin/Quirks", [
	"tinymce/Env",
	"tinymce/util/Tools",
	"tinymce/pasteplugin/WordFilter",
	"tinymce/pasteplugin/Utils"
], function(Env, Tools, WordFilter, Utils) {
	"use strict";

	return function(editor) {
		function addPreProcessFilter(filterFunc) {
			editor.on('BeforePastePreProcess', function(e) {
				e.content = filterFunc(e.content);
			});
		}

		/**
		 * Removes WebKit fragment comments and converted-space spans.
		 *
		 * This:
		 *   <!--StartFragment-->a<span class="Apple-converted-space">&nbsp;</span>b<!--EndFragment-->
		 *
		 * Becomes:
		 *   a&nbsp;b
		 */
		function removeWebKitFragments(html) {
			html = Utils.filter(html, [
				/^[\s\S]*<!--StartFragment-->|<!--EndFragment-->[\s\S]*$/g,        // WebKit fragment
				[/<span class="Apple-converted-space">\u00a0<\/span>/g, '\u00a0'], // WebKit &nbsp;
				/<br>$/															   // Traling BR elements
			]);

			return html;
		}

		/**
		 * Removes BR elements after block elements. IE9 has a nasty bug where it puts a BR element after each
		 * block element when pasting from word. This removes those elements.
		 *
		 * This:
		 *  <p>a</p><br><p>b</p>
		 *
		 * Becomes:
		 *  <p>a</p><p>b</p>
		 */
		function removeExplorerBrElementsAfterBlocks(html) {
			// Only filter word specific content
			if (!WordFilter.isWordContent(html)) {
				return html;
			}

			// Produce block regexp based on the block elements in schema
			var blockElements = [];

			Tools.each(editor.schema.getBlockElements(), function(block, blockName) {
				blockElements.push(blockName);
			});

			var explorerBlocksRegExp = new RegExp(
				'(?:<br>&nbsp;[\\s\\r\\n]+|<br>)*(<\\/?(' + blockElements.join('|') + ')[^>]*>)(?:<br>&nbsp;[\\s\\r\\n]+|<br>)*',
				'g'
			);

			// Remove BR:s from: <BLOCK>X</BLOCK><BR>
			html = Utils.filter(html, [
				[explorerBlocksRegExp, '$1']
			]);

			// IE9 also adds an extra BR element for each soft-linefeed and it also adds a BR for each word wrap break
			html = Utils.filter(html, [
				[/<br><br>/g, '<BR><BR>'], // Replace multiple BR elements with uppercase BR to keep them intact
				[/<br>/g, ' '],            // Replace single br elements with space since they are word wrap BR:s
				[/<BR><BR>/g, '<br>']      // Replace back the double brs but into a single BR
			]);

			return html;
		}

		/**
		 * WebKit has a nasty bug where the all runtime styles gets added to style attributes when copy/pasting contents.
		 * This fix solves that by simply removing the whole style attribute.
		 *
		 * Todo: This can be made smarter. Keeping styles that override existing ones etc.
		 *
		 * @param {String} content Content that needs to be processed.
		 * @return {String} Processed contents.
		 */
		function removeWebKitStyles(content) {
			if (editor.settings.paste_remove_styles || editor.settings.paste_remove_styles_if_webkit !== false) {
				content = content.replace(/ style=\"[^\"]+\"/g, '');
			}

			return content;
		}

		// Sniff browsers and apply fixes since we can't feature detect
		if (Env.webkit) {
			addPreProcessFilter(removeWebKitStyles);
			addPreProcessFilter(removeWebKitFragments);
		}

		if (Env.ie) {
			addPreProcessFilter(removeExplorerBrElementsAfterBlocks);
		}
	};
});