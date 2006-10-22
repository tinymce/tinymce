/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

/**#@+
 * @member TinyMCE_Engine
 * @method
 */

/**
 * Sets the enabled/disabled state of build in events on the specific node.
 * This function is needed since some events gets executed in WYSIWYG mode.
 *
 * @param {HTMLNode} node HTML node to enable/disable events on.
 * @param {boolean} state true/false state if the events should be disabled or enabled.
 * @private
 */
TinyMCE_Engine.prototype._setEventsEnabled = function(node, state) {
	var evs, x, y, elms, i, event;
	var events = ['onfocus','onblur','onclick','ondblclick',
				'onmousedown','onmouseup','onmouseover','onmousemove',
				'onmouseout','onkeypress','onkeydown','onkeydown','onkeyup'];

	evs = tinyMCE.settings['event_elements'].split(',');
	for (y=0; y<evs.length; y++){
		elms = node.getElementsByTagName(evs[y]);
		for (i=0; i<elms.length; i++) {
			event = "";

			for (x=0; x<events.length; x++) {
				if ((event = tinyMCE.getAttrib(elms[i], events[x])) != '') {
					event = tinyMCE.cleanupEventStr("" + event);

					if (!state)
						event = "return true;" + event;
					else
						event = event.replace(/^return true;/gi, '');

					elms[i].removeAttribute(events[x]);
					elms[i].setAttribute(events[x], event);
				}
			}
		}
	}
};

/**
 * Patch function for MSIE specific events, this one simply grabs the window.event object and
 * passes it as a argument to the handleEvent function of the TinyMCE_Engine class.
 *
 * @param {string} editor_id Editor id to patch.
 * @private
 */
TinyMCE_Engine.prototype._eventPatch = function(editor_id) {
	var n, inst, win, e;

	// Remove odd, error
	if (typeof(tinyMCE) == "undefined")
		return true;

	try {
		// Try selected instance first
		if (tinyMCE.selectedInstance) {
			win = tinyMCE.selectedInstance.getWin();

			if (win && win.event) {
				e = win.event;

				if (!e.target)
					e.target = e.srcElement;

				TinyMCE_Engine.prototype.handleEvent(e);
				return;
			}
		}

		// Search for it
		for (n in tinyMCE.instances) {
			inst = tinyMCE.instances[n];

			if (!tinyMCE.isInstance(inst))
				continue;

			inst.select();
			win = inst.getWin();

			if (win && win.event) {
				e = win.event;

				if (!e.target)
					e.target = e.srcElement;

				TinyMCE_Engine.prototype.handleEvent(e);
				return;
			}
		}
	} catch (ex) {
		// Ignore error if iframe is pointing to external URL
	}
};

TinyMCE_Engine.prototype.findEvent = function(e) {
	var n, inst;

	if (e)
		return e;

	for (n in tinyMCE.instances) {
		inst = tinyMCE.instances[n];

		if (tinyMCE.isInstance(inst) && inst.getWin().event)
			return inst.getWin().event;
	}

	return null;
};

/**
 * Unload document event handler function. This function will be executed when the
 * page is unloaded, this will automaticly move the current editor contents to the textarea element this enables
 * the editor to restore it's state when the user presses the back button in the browser.
 * This will execute the triggerSave function.
 */
TinyMCE_Engine.prototype.unloadHandler = function() {
	tinyMCE.triggerSave(true, true);
};

/**
 * Adds the handleEvent function to the specified editor instance.
 *
 * @param {inst} inst Editor control instance to add event handler to.
 */
TinyMCE_Engine.prototype.addEventHandlers = function(inst) {
	this.setEventHandlers(inst, 1);
};

/**
 * Sets or removes event handles form the specified instance.
 *
 * @param {bool} s True/false state if to add or remove event handlers.
 */
TinyMCE_Engine.prototype.setEventHandlers = function(inst, s) {
	var doc = inst.getDoc(), ie, ot, i, f = s ? tinyMCE.addEvent : tinyMCE.removeEvent;

	ie = ['keypress', 'keyup', 'keydown', 'click', 'mouseup', 'mousedown', 'controlselect', 'dblclick'];
	ot = ['keypress', 'keyup', 'keydown', 'click', 'mouseup', 'mousedown', 'focus', 'blur', 'dragdrop'];

	inst.switchSettings();

	if (tinyMCE.isIE) {
		for (i=0; i<ie.length; i++)
			f(doc, ie[i], TinyMCE_Engine.prototype._eventPatch);
	} else {
		for (i=0; i<ot.length; i++)
			f(doc, ot[i], tinyMCE.handleEvent);

		eval('try { doc.designMode = "On"; } catch(e) {}'); // Force designmode
	}
};

/**
 * Mouse move handler function, this will be executed each time
 * the mouse is moved within a editor instance. This function stores away the current selection in MSIE
 * this will then be used when a undo/redo level is added.
 */
TinyMCE_Engine.prototype.onMouseMove = function() {
	var inst;

	if (!tinyMCE.hasMouseMoved) {
		inst = tinyMCE.selectedInstance;

		// Workaround for bug #1437457 (Odd MSIE bug)
		if (inst.isFocused) {
			inst.undoBookmark = inst.selection.getBookmark();
			tinyMCE.hasMouseMoved = true;
		}
	}

//	tinyMCE.cancelEvent(inst.getWin().event);
//	return false;
};

/**
 * Cancels the specified event, this will disable the event from be passed to other listeners in event chain.
 *
 * @param {DOMEvent} e Event to cancel.
 * @return Returns false.
 * @type bool
 */
TinyMCE_Engine.prototype.cancelEvent = function(e) {
	if (!e)
		return false;

	if (tinyMCE.isIE) {
		e.returnValue = false;
		e.cancelBubble = true;
	} else {
		e.preventDefault();
		e.stopPropagation && e.stopPropagation();
	}

	return false;
};

/**
 * Adds a event handler function to the specified object.
 *
 * @param {HTMLElement} o Object to add event handler to.
 * @param {string} n Event name to listen to for example "click".
 * @param {function} h Function handler to execute when event occurs.
 */
TinyMCE_Engine.prototype.addEvent = function(o, n, h) {
	// Add cleanup for all non unload events
	if (n != 'unload') {
		function clean() {
			var ex;

			try {
				tinyMCE.removeEvent(o, n, h);
				tinyMCE.removeEvent(window, 'unload', clean);
				o = n = h = null;
			} catch (ex) {
				// IE may produce access denied exception on unload
			}
		}

		// Add memory cleaner
		tinyMCE.addEvent(window, 'unload', clean);
	}

	if (o.attachEvent)
		o.attachEvent("on" + n, h);
	else
		o.addEventListener(n, h, false);
};

/**
 * Removes a event handler function from the specified object.
 *
 * @param {HTMLElement} o Object to remove event handler from.
 * @param {string} n Event name to stop listening for. Example "click".
 * @param {function} h Function handler to detach from the event.
 */
TinyMCE_Engine.prototype.removeEvent = function(o, n, h) {
	if (o.detachEvent)
		o.detachEvent("on" + n, h);
	else
		o.removeEventListener(n, h, false);
};

/**
 * Adds accessibility keydown handler to the specified select element.
 *
 * @param {DOMEvent} e Event that gets passed when the element is focused.
 * @param {HTMLElement} s Select element that the keydown handler gets added to.
 * @param {DOMWindow} w DOM window reference to add.
 */
TinyMCE_Engine.prototype.addSelectAccessibility = function(e, s, w) {
	// Add event handlers 
	if (!s._isAccessible) {
		s.onkeydown = tinyMCE.accessibleEventHandler;
		s.onblur = tinyMCE.accessibleEventHandler;
		s._isAccessible = true;
		s._win = w;
	}

	return false;
};

/**
 * Accessibility handler that gets executed when the user hits a key in a select element.
 * This handler trams the enter/return or space key and then executes the onchange event handler.
 *
 * @param {DOMEvent} e DOM event object instance.
 */
TinyMCE_Engine.prototype.accessibleEventHandler = function(e) {
	var win = this._win;
	e = tinyMCE.isIE ? win.event : e;
	var elm = tinyMCE.isIE ? e.srcElement : e.target;

	// Unpiggyback onchange on blur
	if (e.type == "blur") {
		if (elm.oldonchange) {
			elm.onchange = elm.oldonchange;
			elm.oldonchange = null;
		}

		return true;
	}

	// Piggyback onchange
	if (elm.nodeName == "SELECT" && !elm.oldonchange) {
		elm.oldonchange = elm.onchange;
		elm.onchange = null;
	}

	// Execute onchange and remove piggyback
	if (e.keyCode == 13 || e.keyCode == 32) {
		elm.onchange = elm.oldonchange;
		elm.onchange();
		elm.oldonchange = null;

		tinyMCE.cancelEvent(e);
		return false;
	}

	return true;
};

/**
 * Resets the iframe width and height to it's old values before a drag/drop operation occured.
 * This function is used in a workaround for a MSIE bug where drag/drop fails in iframes with width/height in %. 
 */ 
TinyMCE_Engine.prototype._resetIframeHeight = function() {
	var ife;

	if (tinyMCE.isRealIE) {
		ife = tinyMCE.selectedInstance.iframeElement;

/*		if (ife._oldWidth) {
			ife.style.width = ife._oldWidth;
			ife.width = ife._oldWidth;
		}*/

		if (ife._oldHeight) {
			ife.style.height = ife._oldHeight;
			ife.height = ife._oldHeight;
		}
	}
};

/**#@-*/
