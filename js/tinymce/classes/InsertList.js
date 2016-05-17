/**
 * InsertList.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Handles inserts of lists into the editor instance.
 *
 * @class tinymce.InsertList
 * @private
 */
define("tinymce/InsertList", [
	"tinymce/util/Tools",
	"tinymce/caret/CaretWalker",
	"tinymce/caret/CaretPosition"
], function(Tools, CaretWalker, CaretPosition) {
	var isListFragment = function(fragment) {
		var firstChild = fragment.firstChild;
		var lastChild = fragment.lastChild;

		// Skip meta since it's likely <meta><ul>..</ul>
		if (firstChild && firstChild.name === 'meta') {
			firstChild = firstChild.next;
		}

		// Skip mce_marker since it's likely <ul>..</ul><span id="mce_marker"></span>
		if (lastChild && lastChild.attr('id') === 'mce_marker') {
			lastChild = lastChild.prev;
		}

		if (!firstChild || firstChild !== lastChild) {
			return false;
		}

		return firstChild.name === 'ul' || firstChild.name === 'ol';
	};

	var toDomFragment = function(dom, serializer, fragment) {
		var html = serializer.serialize(fragment);
		var domFragment = dom.createFragment(html);

		if (domFragment.firstChild.nodeName === 'META') {
			dom.remove(domFragment.firstChild);
		}

		return domFragment;
	};

	var listItems = function(elm) {
		return Tools.grep(elm.childNodes, function(child) {
			return child.nodeName === 'LI';
		});
	};

	var getParentLi = function(dom, node) {
		var parentBlock = dom.getParent(node, dom.isBlock);
		return parentBlock && parentBlock.nodeName === 'LI' ? parentBlock : null;
	};

	var isParentBlockLi = function(dom, node) {
		return !!getParentLi(dom, node);
	};

	var getSplit = function(parentNode, rng) {
		var beforeRng = rng.cloneRange();
		var afterRng = rng.cloneRange();

		beforeRng.setStartBefore(parentNode);
		afterRng.setEndAfter(parentNode);

		return [
			beforeRng.cloneContents(),
			afterRng.cloneContents()
		];
	};

	var findFirstPosition = function(node, rootNode) {
		var caretPos = CaretPosition.before(node);
		var caretWalker = new CaretWalker(rootNode);

		return caretWalker.next(caretPos);
	};

	var findLastPosition = function(node, rootNode) {
		var caretPos = CaretPosition.after(node);
		var caretWalker = new CaretWalker(rootNode);

		return caretWalker.prev(caretPos);
	};

	var insertAtCaret = function(serializer, dom, rng, fragment) {
		var domFragment = toDomFragment(dom, serializer, fragment);
		var liTarget = getParentLi(dom, rng.startContainer);
		var liParent = liTarget.parentNode;
		var liElms = listItems(domFragment.firstChild);
		var BEGINNING = 1, END = 2;

		var isAt = function(location) {
			var caretPos = CaretPosition.fromRangeStart(rng);
			var caretWalker = new CaretWalker(dom.getRoot());
			var newPos = location === BEGINNING ? caretWalker.prev(caretPos) : caretWalker.next(caretPos);

			return newPos ? getParentLi(dom, newPos.getNode()) !== liTarget : true;
		};

		var insertMiddle = function() {
			var parts = getSplit(liTarget, rng);

			liParent.insertBefore(parts[0], liTarget);
			Tools.each(liElms, function(li) {
				liParent.insertBefore(li, liTarget);
			});
			liParent.insertBefore(parts[1], liTarget);
			liParent.removeChild(liTarget);

			return findLastPosition(liElms[liElms.length - 1], dom.getRoot()).toRange();
		};

		var insertBefore = function() {
			Tools.each(liElms, function(li) {
				liParent.insertBefore(li, liTarget);
			});

			return findFirstPosition(liTarget, dom.getRoot()).toRange();
		};

		var insertAfter = function() {
			Tools.each(liElms.reverse(), function(li) {
				dom.insertAfter(li, liTarget);
			});

			return findLastPosition(liElms[liElms.length - 1], dom.getRoot()).toRange();
		};

		if (isAt(BEGINNING)) {
			return insertBefore();
		} else if (isAt(END)) {
			return insertAfter();
		}

		return insertMiddle();
	};

	return {
		isListFragment: isListFragment,
		insertAtCaret: insertAtCaret,
		isParentBlockLi: isParentBlockLi
	};
});