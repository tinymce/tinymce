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
		offset = offset || 0;

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

function initWhenTinyAndRobotAreReady(initTinyFunction) {
	function loaded() {
		QUnit.start();
	}

	tinymce.on('AddEditor', function(e) {
		e.editor.on('Init', function() {
			loaded();
		});
	});

	window.robot.onload(initTinyFunction);
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

// TODO: Replace this with the new event logic in 3.5
function type(chr) {
	var editor = tinymce.activeEditor, keyCode, charCode, event = tinymce.dom.Event, evt, startElm;

	function fakeEvent(target, type, evt) {
		editor.dom.fire(target, type, evt);
	};

	// Numeric keyCode
	if (typeof(chr) == "number") {
		charCode = keyCode = chr;
	} else if (typeof(chr) == "string") {
		// String value
		if (chr == '\b') {
			keyCode = 8;
			charCode = chr.charCodeAt(0);
		} else if (chr == '\n') {
			keyCode = 13;
			charCode = chr.charCodeAt(0);
		} else {
			charCode = chr.charCodeAt(0);
			keyCode = charCode;
		}
	} else {
		evt = chr;
	}

	evt = evt || {keyCode: keyCode, charCode: charCode};

	startElm = editor.selection.getStart();
	fakeEvent(startElm, 'keydown', evt);
	fakeEvent(startElm, 'keypress', evt);

	if (!evt.isDefaultPrevented()) {
		if (keyCode == 8) {
			if (editor.getDoc().selection) {
				var rng = editor.getDoc().selection.createRange();

				if (rng.text.length == 0) {
					rng.moveStart('character', -1);
					rng.select();
				}

				rng.execCommand('Delete', false, null);
			} else {
				editor.getDoc().execCommand('Delete', false, null);
			}
		} else if (typeof(chr) == 'string') {
			var rng = editor.selection.getRng(true);

			if (rng.startContainer.nodeType == 3 && rng.collapsed) {
				rng.startContainer.insertData(rng.startOffset, chr);
				rng.setStart(rng.startContainer, rng.startOffset + 1);
				rng.collapse(true);
				editor.selection.setRng(rng);
			} else {
				rng.insertNode(editor.getDoc().createTextNode(chr));
			}
		}
	}

	fakeEvent(startElm, 'keyup', evt);
}

function cleanHtml(html) {
	html = html.toLowerCase().replace(/[\r\n]+/gi, '');
	html = html.replace(/ (sizcache|nodeindex|sizset|data\-mce\-expando|data\-mce\-selected)="[^"]*"/gi, '');
	html = html.replace(/<span[^>]+data-mce-bogus[^>]+>[\u200B\uFEFF]+<\/span>|<div[^>]+data-mce-bogus[^>]+><\/div>/gi, '');

	return html;
}

/**
 * Measures the x, y, w, h of the specified element/control relative to the view element.
 */
function rect(ctrl) {
	var outerRect, innerRect;

	if (ctrl.nodeType) {
		innerRect = ctrl.getBoundingClientRect();
	} else {
		innerRect = ctrl.getEl().getBoundingClientRect();
	}

	outerRect = document.getElementById('view').getBoundingClientRect();

	return [
		Math.round(innerRect.left - outerRect.left),
		Math.round(innerRect.top - outerRect.top),
		Math.round(innerRect.right - innerRect.left),
		Math.round(innerRect.bottom - innerRect.top)
	];
}

function resetScroll(elm) {
	elm.scrollTop = 0;
	elm.scrollLeft = 0;
}

// Needed since fonts render differently on different platforms
function nearlyEqualRects(rect1, rect2, diff) {
	diff = diff || 1;

	for (var i = 0; i < 4; i++) {
		if (Math.abs(rect1[i] - rect2[i]) > diff) {
			deepEqual(rect1, rect2);
			return;
		}
	}

	ok(true);
}
