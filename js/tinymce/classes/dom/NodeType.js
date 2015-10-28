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
		names = names.toLowerCase().split(' ');

		return function(node) {
			var i, name;

			if (node && node.nodeType) {
				name = node.nodeName.toLowerCase();

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
			return isElement(node) && node[propName] === propValue;
		};
	}

	function hasAttributeValue(attrName, attrValue) {
		return function(node) {
			return isElement(node) && node.getAttribute(attrName) === attrValue;
		};
	}

	function isBogus(node) {
		return isElement(node) && node.hasAttribute('data-mce-bogus');
	}

	function hasContentEditableState(value) {
		return function(node) {
			if (isElement(node)) {
				if (node.contentEditable === value) {
					return true;
				}

				if (node.getAttribute('data-mce-contenteditable') === value) {
					return true;
				}
			}

			return false;
		};
	}

	return {
		isText: isNodeType(3),
		isElement: isElement,
		isComment: isNodeType(8),
		isBr: matchNodeNames('br'),
		isContentEditableTrue: hasContentEditableState('true'),
		isContentEditableFalse: hasContentEditableState('false'),
		matchNodeNames: matchNodeNames,
		hasPropValue: hasPropValue,
		hasAttributeValue: hasAttributeValue,
		matchStyleValues: matchStyleValues,
		isBogus: isBogus
	};
});