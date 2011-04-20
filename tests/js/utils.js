function fontFace(face) {
	if (tinymce.isOpera) {
		return "'" + face + "'";
	} else {
		return face;
	}
}

function findContainer(selector) {
	var container;
	if (tinymce.is(selector, 'string')) {
		container = editor.dom.select(selector)[0];
	} else {
		container = selector;
	}
	if (container.firstChild) {
		container = container.firstChild;
	}
	return container;
}

function setSelection(startSelector, startOffset, endSelector, endOffset) {
	if (!endSelector) {
		endSelector = startSelector;
		endOffset = startOffset;
	}
	var startContainer = findContainer(startSelector);
	var endContainer = findContainer(endSelector);
	var rng = editor.dom.createRng();
	
	function setRange(container, offset, start) {
		if (offset === 'after') {
			if (start) {
				rng.setStartAfter(container);
			} else {
				rng.setEndAfter(container);
			}
			return;
		} else if (offset === 'afterNextCharacter') {
			container = container.nextSibling;
			offset = 1;
		}
		if (start) {
			rng.setStart(container, offset);
		} else {
			rng.setEnd(container, offset);
		}
	}
	setRange(startContainer, startOffset, true);
	setRange(endContainer, endOffset, false);
	editor.selection.setRng(rng);
}

function initWhenTinyAndRobotAreReady() {
	var readyCount = 0;
	function checkLoaded() {
		readyCount++;
		if (readyCount > 2) {
			ok(false, "Critical error: Received too many onload events.");
		} else if (readyCount === 2) {
			QUnit.start();
		}
	}
	window.robot.onload(checkLoaded);
	tinymce.onAddEditor.add(function(tinymce, ed) {
		ed.onInit.add(function() {
			checkLoaded();
		});
	});
}

function trimContent(content) {
	return content.replace(/^<p>&nbsp;<\/p>\n?/, '').replace(/\n?<p>&nbsp;<\/p>$/, '');
}

/**
 * Fakes a key event.
 *
 * @param {Element/String} e DOM element object or element id to send fake event to.
 * @param {String} na Event name to fake like "keydown".
 * @param {Object} o Optional object with data to send with the event like keyCode and charCode.
 */
function fakeKeyEvent(e, na, o) {
	var ev;

	o = tinymce.extend({
		keyCode : 13,
		charCode : 0
	}, o);

	e = tinymce.DOM.get(e);

	if (e.fireEvent) {
		ev = document.createEventObject();
		tinymce.extend(ev, o);
		e.fireEvent('on' + na, ev);
		return;
	}

	if (document.createEvent) {
		try {
			// Fails in Safari
			ev = document.createEvent('KeyEvents');
			ev.initKeyEvent(na, true, true, window, false, false, false, false, o.keyCode, o.charCode);
		} catch (ex) {
			ev = document.createEvent('Events');
			ev.initEvent(na, true, true);

			ev.keyCode = o.keyCode;
			ev.charCode = o.charCode;
		}
	} else {
		ev = document.createEvent('UIEvents');

		if (ev.initUIEvent)
			ev.initUIEvent(na, true, true, window, 1);

		ev.keyCode = o.keyCode;
		ev.charCode = o.charCode;
	}

	e.dispatchEvent(ev);
}

function normalizeRng(rng) {
	if (rng.startContainer.nodeType == 3) {
		if (rng.startOffset == 0)
			rng.setStartBefore(rng.startContainer);
		else if (rng.startOffset >= rng.startContainer.nodeValue.length - 1)
			rng.setStartAfter(rng.startContainer);
	}

	if (rng.endContainer.nodeType == 3) {
		if (rng.endOffset == 0)
			rng.setEndBefore(rng.endContainer);
		else if (rng.endOffset >= rng.endContainer.nodeValue.length - 1)
			rng.setEndAfter(rng.endContainer);
	}

	return rng;
}
