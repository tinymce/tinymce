/**
 * WordGetter.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce.wordcount.text.WordGetter", [
	"tinymce.wordcount.text.UnicodeData",
	"tinymce.wordcount.text.StringMapper",
	"tinymce.wordcount.text.IsWordBoundary"
], function(UnicodeData, StringMapper, IsWordBoundary) {
	var EMPTY_STRING = UnicodeData.EMPTY_STRING;
	var WHITESPACE = UnicodeData.WHITESPACE;
	var PUNCTUATION = UnicodeData.PUNCTUATION;
	var wordGetter = function (string, options) {
			var i = 0,
					map = StringMapper(string),
					len = map.length,
					word = [],
					words = [],
					chr,
					includePunctuation,
					includeWhitespace;

			if (!options) {
					options = {};
			}

			if (options.ignoreCase) {
					string = string.toLowerCase();
			}

			includePunctuation = options.includePunctuation;
			includeWhitespace = options.includeWhitespace;

			// Loop through each character in the classification map and determine
			// whether it precedes a word boundary, building an array of distinct
			// words as we go.
			for (; i < len; ++i) {
					chr = string.charAt(i);

					// Append this character to the current word.
					word.push(chr);

					// If there's a word boundary between the current character and the
					// next character, append the current word to the words array and
					// start building a new word.
					if (IsWordBoundary(map, i)) {
							word = word.join(EMPTY_STRING);

							if (word &&
											(includeWhitespace || !WHITESPACE.test(word)) &&
											(includePunctuation || !PUNCTUATION.test(word))) {
									words.push(word);
							}

							word = [];
					}
			}

			return words;
	};

	return wordGetter;
});