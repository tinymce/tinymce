(function() {
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

			if (ev.initUIEvent) {
				ev.initUIEvent(na, true, true, window, 1);
			}

			ev.keyCode = o.keyCode;
			ev.charCode = o.charCode;
		}

		e.dispatchEvent(ev);
	}

	function normalizeRng(rng) {
		if (rng.startContainer.nodeType == 3) {
			if (rng.startOffset === 0) {
				rng.setStartBefore(rng.startContainer);
			} else if (rng.startOffset >= rng.startContainer.nodeValue.length - 1) {
				rng.setStartAfter(rng.startContainer);
			}
		}

		if (rng.endContainer.nodeType == 3) {
			if (rng.endOffset === 0) {
				rng.setEndBefore(rng.endContainer);
			} else if (rng.endOffset >= rng.endContainer.nodeValue.length - 1) {
				rng.setEndAfter(rng.endContainer);
			}
		}

		return rng;
	}

	// TODO: Replace this with the new event logic in 3.5
	function type(chr) {
		var editor = tinymce.activeEditor, keyCode, charCode, evt, startElm, rng;

		function fakeEvent(target, type, evt) {
			editor.dom.fire(target, type, evt);
		}

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
					rng = editor.getDoc().selection.createRange();

					if (rng.text.length === 0) {
						rng.moveStart('character', -1);
						rng.select();
					}

					rng.execCommand('Delete', false, null);
				} else {
					rng = editor.selection.getRng();

					if (rng.startContainer.nodeType == 1 && rng.collapsed) {
						var nodes = rng.startContainer.childNodes, lastNode = nodes[nodes.length - 1];

						// If caret is at <p>abc|</p> and after the abc text node then move it to the end of the text node
						// Expand the range to include the last char <p>ab[c]</p> since IE 11 doesn't delete otherwise
						if (rng.startOffset >= nodes.length - 1 && lastNode && lastNode.nodeType == 3 && lastNode.data.length > 0) {
							rng.setStart(lastNode, lastNode.data.length - 1);
							rng.setEnd(lastNode, lastNode.data.length);
							editor.selection.setRng(rng);
						}
					}

					editor.getDoc().execCommand('Delete', false, null);
				}
			} else if (typeof(chr) == 'string') {
				rng = editor.selection.getRng(true);

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
		html = html.replace(/ (sizcache[0-9]+|sizcache|nodeindex|sizset[0-9]+|sizset|data\-mce\-expando|data\-mce\-selected)="[^"]*"/gi, '');
		html = html.replace(/<span[^>]+data-mce-bogus[^>]+>[\u200B\uFEFF]+<\/span>|<div[^>]+data-mce-bogus[^>]+><\/div>/gi, '');
		html = html.replace(/ style="([^"]+)"/gi, function(val1, val2) {
			val2 = val2.replace(/;$/, '');
			return ' style="' + val2.replace(/\:([^ ])/g, ': $1') + ';"';
		});

		return html;
	}

	function normalizeHtml(html) {
		var writer = new tinymce.html.Writer();

		new tinymce.html.SaxParser({
			validate: false,
			comment: writer.comment,
			cdata: writer.cdata,
			text: writer.text,
			end: writer.end,
			pi: writer.pi,
			doctype: writer.doctype,

			start: function(name, attrs, empty) {
				attrs.sort(function(a, b) {
					if (a.name === b.name) {
						return 0;
					}

					return a.name > b.name ? 1 : -1;
				});

				writer.start(name, attrs, empty);
			}
		}).parse(html);

		return writer.getContent();
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

	function size(ctrl) {
		return rect(ctrl).slice(2);
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

	function getFontmostWindow() {
		return editor.windowManager.windows[editor.windowManager.windows.length - 1];
	}

	function pressArrowKey(evt) {
		var dom = editor.dom, target = editor.selection.getNode();

		evt = tinymce.extend({keyCode: 37}, evt);

		dom.fire(target, 'keydown', evt);
		dom.fire(target, 'keypress', evt);
		dom.fire(target, 'keyup', evt);
	}

	function pressEnter(evt) {
		var dom = editor.dom, target = editor.selection.getNode();

		evt = tinymce.extend({keyCode: 13}, evt);

		dom.fire(target, 'keydown', evt);
		dom.fire(target, 'keypress', evt);
		dom.fire(target, 'keyup', evt);
	}

	function trimBrsOnIE(html) {
		return html.replace(/<br[^>]*>/gi, '');
	}

	function patch(proto, name, patchFunc) {
		var originalFunc = proto[name];
		var originalFuncs = proto.__originalFuncs;

		if (!originalFuncs) {
			proto.__originalFuncs = originalFuncs = {};
		}

		if (!originalFuncs[name]) {
			originalFuncs[name] = originalFunc;
		} else {
			originalFunc = originalFuncs[name];
		}

		proto[name] = function() {
			var args = Array.prototype.slice.call(arguments);
			args.unshift(originalFunc);
			return patchFunc.apply(this, args);
		};
	}

	function unpatch(proto, name) {
		var originalFuncs = proto.__originalFuncs;

		if (!originalFuncs) {
			return;
		}

		if (name) {
			proto[name] = originalFuncs[name];
			delete originalFuncs[name];
		} else {
			for (var key in originalFuncs) {
				proto[key] = originalFuncs[key];
			}

			delete proto.__originalFuncs;
		}
	}

	function triggerElementChange(element){
		var evt;

		if ("createEvent" in document) {
			evt = document.createEvent("HTMLEvents");
			evt.initEvent("change", false, true);
			element.dispatchEvent(evt);
		} else {
			element.fireEvent("onchange");
		}
	}

	window.Utils = {
		fontFace: fontFace,
		findContainer: findContainer,
		setSelection: setSelection,
		trimContent: trimContent,
		fakeKeyEvent: fakeKeyEvent,
		normalizeRng: normalizeRng,
		type: type,
		cleanHtml: cleanHtml,
		normalizeHtml: normalizeHtml,
		rect: rect,
		size: size,
		resetScroll: resetScroll,
		nearlyEqualRects: nearlyEqualRects,
		getFontmostWindow: getFontmostWindow,
		pressArrowKey: pressArrowKey,
		pressEnter: pressEnter,
		trimBrsOnIE: trimBrsOnIE,
		patch: patch,
		unpatch: unpatch,
		triggerElementChange: triggerElementChange
	};
})();
