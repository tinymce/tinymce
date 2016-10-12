/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/wordcount/Plugin", [
	"tinymce/wordcount/UnicodeData"
], function(UnicodeData) {
	var ALETTER = 0;
	var MIDNUMLET = 1;
	var MIDLETTER = 2;
	var MIDNUM = 3;
	var NUMERIC = 4;
	var CR = 5;
	var LF = 6;
	var NEWLINE = 7;
	var EXTEND = 8;
	var FORMAT = 9;
	var KATAKANA = 10;
	var EXTENDNUMLET = 11;
	var OTHER = 12;

	// RegExp objects generated from code point data. Each regex matches a single
	// character against a set of Unicode code points. The index of each item in
	// this array must match its corresponding code point constant value defined
	// above.
	var SETS = [
			new RegExp(UnicodeData.aletter),
			new RegExp(UnicodeData.midnumlet),
			new RegExp(UnicodeData.midletter),
			new RegExp(UnicodeData.midnum),
			new RegExp(UnicodeData.numeric),
			new RegExp(UnicodeData.cr),
			new RegExp(UnicodeData.lf),
			new RegExp(UnicodeData.newline),
			new RegExp(UnicodeData.extend),
			new RegExp(UnicodeData.format),
			new RegExp(UnicodeData.katakana),
			new RegExp(UnicodeData.extendnumlet)
	];

	var EMPTY_STRING = '';
	var PUNCTUATION = new RegExp('^' + UnicodeData.punctuation + '$');
	var WHITESPACE = /\s/;

	var classify = function (string) {
			var chr;
			var map = [];
			var i = 0;
			var j;
			var set;
			var stringLength = string.length;
			var setsLength = SETS.length;
			var type;

			for (; i < stringLength; ++i) {
					chr = string.charAt(i);
					type = OTHER;

					for (j = 0; j < setsLength; ++j) {
							set = SETS[j];

							if (set && set.test(chr)) {
									type = j;
									break;
							}
					}

					map.push(type);
			}

			return map;
	};

	var indexToType = function (string, index) {
		var setsLength = SETS.length;
		var chr = string.charAt(index);
		var j;
		for (j = 0; j < setsLength; ++j) {
				var set = SETS[j];

				if (set && set.test(chr)) {
						return j;
				}
		}
		return OTHER;
	};

	var isWordBoundary = function (string, index, fun) {
			var prevType;
			var type = fun(string, index);
			var nextType = fun(string, index + 1);
			var nextNextType;

			if (index < 0 || (index > string.length - 1 && index !== 0)) {
					console.log('isWordBoundary: index out of bounds', 'warn', 'text-wordbreak');
					return false;
			}

			// WB5. Don't break between most letters.
			if (type === ALETTER && nextType === ALETTER) {
					return false;
			}

			nextNextType = fun(string, index + 2);

			// WB6. Don't break letters across certain punctuation.
			if (type === ALETTER &&
							(nextType === MIDLETTER || nextType === MIDNUMLET) &&
							nextNextType === ALETTER) {
					return false;
			}

			prevType = fun(string, index - 1);

			// WB7. Don't break letters across certain punctuation.
			if ((type === MIDLETTER || type === MIDNUMLET) &&
							nextType === ALETTER &&
							prevType === ALETTER) {
					return false;
			}

			// WB8/WB9/WB10. Don't break inside sequences of digits or digits
			// adjacent to letters.
			if ((type === NUMERIC || type === ALETTER) &&
							(nextType === NUMERIC || nextType === ALETTER)) {
					return false;
			}

			// WB11. Don't break inside numeric sequences like "3.2" or
			// "3,456.789".
			if ((type === MIDNUM || type === MIDNUMLET) &&
							nextType === NUMERIC &&
							prevType === NUMERIC) {
					return false;
			}

			// WB12. Don't break inside numeric sequences like "3.2" or
			// "3,456.789".
			if (type === NUMERIC &&
							(nextType === MIDNUM || nextType === MIDNUMLET) &&
							nextNextType === NUMERIC) {
					return false;
			}

			// WB4. Ignore format and extend characters.
			if (type === EXTEND || type === FORMAT ||
							prevType === EXTEND || prevType === FORMAT ||
							nextType === EXTEND || nextType === FORMAT) {
					return false;
			}

			// WB3. Don't break inside CRLF.
			if (type === CR && nextType === LF) {
					return false;
			}

			// WB3a. Break before newlines (including CR and LF).
			if (type === NEWLINE || type === CR || type === LF) {
					return true;
			}

			// WB3b. Break after newlines (including CR and LF).
			if (nextType === NEWLINE || nextType === CR || nextType === LF) {
					return true;
			}

			// WB13. Don't break between Katakana characters.
			if (type === KATAKANA && nextType === KATAKANA) {
					return false;
			}

			// WB13a. Don't break from extenders.
			if (nextType === EXTENDNUMLET &&
							(type === ALETTER || type === NUMERIC || type === KATAKANA ||
							type === EXTENDNUMLET)) {
					return false;
			}

			// WB13b. Don't break from extenders.
			if (type === EXTENDNUMLET &&
							(nextType === ALETTER || nextType === NUMERIC ||
							nextType === KATAKANA)) {
					return false;
			}

			// Break after any character not covered by the rules above.
			return true;
	};

	var plugin = function (string, options) {
			var i = 0;
			var map = classify(string);
			var len = map.length;
			var word = [];
			var words = [];
			var chr;
			var includePunctuation;
			var includeWhitespace;

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
					console.log(string, i, isWordBoundary(string, i, indexToType))
					if (isWordBoundary(string, i, indexToType)) {
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
	// getDelimiterIndexes : String -> Number -> Number
	var nextDelimiterIndex = function(str, i) {
		var count = i;
		while (!isWordBoundary(str, count, indexToType)) {
			console.log(count)
			count = count + 1;
		}
		return count === i ? -1 : count + 1;
	};

	return {
		plugin:plugin,
		classify: classify,
		nextDelimiterIndex: nextDelimiterIndex,
		isWordBoundary: isWordBoundary,
		indexToType: indexToType
	};
});
