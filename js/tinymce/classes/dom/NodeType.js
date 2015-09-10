/**
 * NodeType.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains various node validation functions.
 *
 * @private
 * @class tinymce.dom.NodeType
 */
define("tinymce/dom/NodeType", [], function() {
	function isNodeType(type) {
		return function(node) {
			return !!node && node.nodeType == type;
		};
	}

	var isElement = isNodeType(1);

	function matchNodeNames(names) {
		names = names.toUpperCase().split(' ');

		return function(node) {
			var i, name;

			if (node) {
				name = node.nodeName;

				for (i = 0; i < names.length; i++) {
					if (name === names[i]) {
						return true;
					}
				}
			}

			return false;
		};
	}

	function matchStyleValues(name, values) {
		values = values.toLowerCase().split(' ');

		return function(node) {
			var i, cssValue;

			if (isElement(node)) {
				for (i = 0; i < values.length; i++) {
					cssValue = getComputedStyle(node, null).getPropertyValue(name);
					if (cssValue === values[i]) {
						return true;
					}
				}
			}

			return false;
		};
	}

	function hasPropValue(propName, propValue) {
		return function(node) {
			return !!node && node[propName] === propValue;
		};
	}

	function isBogus(node) {
		return isElement(node) && node.hasAttribute('data-mce-bogus');
	}

	function isCaretContainer(node) {
		return isElement(node) && node.hasAttribute('data-mce-caret');
	}

	return {
		isText: isNodeType(3),
		isElement: isElement,
		isComment: isNodeType(8),
		isBr: matchNodeNames('br'),
		isContentEditableTrue: hasPropValue('contentEditable', 'true'),
		isContentEditableFalse: hasPropValue('contentEditable', 'false'),
		matchNodeNames: matchNodeNames,
		hasPropValue: hasPropValue,
		matchStyleValues: matchStyleValues,
		isBogus: isBogus,
		isCaretContainer: isCaretContainer
	};
});