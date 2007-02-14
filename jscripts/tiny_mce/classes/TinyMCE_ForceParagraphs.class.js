/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

/**
 * @class Forces P tags on return/enter in Gecko, Opera and Safari.
 * @member TinyMCE_ForceParagraphs
 * @private
 * @abstract
 */
var TinyMCE_ForceParagraphs = {
	/**#@+
	 * @member TinyMCE_ForceParagraphs
	 * @method
	 * @private
	 * @static
	 */

	/**
	 * Inserts a paragraph at the current cursor location.
	 *
	 * @param {TinyMCE_Control} inst TinyMCE editor control instance.
	 * @param {DOMEvent} e DOM event object.
	 * @return true on success or false if it fails.
	 * @type boolean
	 * @private
	 */
	_insertPara : function(inst, e) {
		var doc = inst.getDoc(), sel = inst.getSel(), body = inst.getBody(), win = inst.contentWindow, rng = sel.getRangeAt(0);
		var rootElm = doc.documentElement, blockName = "P", startNode, endNode, startBlock, endBlock;
		var rngBefore, rngAfter, direct, startNode, startOffset, endNode, endOffset, b = tinyMCE.isOpera ? inst.selection.getBookmark() : null;
		var paraBefore, paraAfter, startChop, endChop, contents, i;

		function isEmpty(para) {
			function isEmptyHTML(html) {
				return html.replace(new RegExp('[ \t\r\n]+', 'g'), '').toLowerCase() === '';
			}

			// Check for images
			if (para.getElementsByTagName("img").length > 0)
				return false;

			// Check for tables
			if (para.getElementsByTagName("table").length > 0)
				return false;

			// Check for HRs
			if (para.getElementsByTagName("hr").length > 0)
				return false;

			// Check all textnodes
			var nodes = tinyMCE.getNodeTree(para, [], 3);
			for (i=0; i<nodes.length; i++) {
				if (!isEmptyHTML(nodes[i].nodeValue))
					return false;
			}

			// No images, no tables, no hrs, no text content then it's empty
			return true;
		}

	//	tinyMCE.debug(body.innerHTML);

	//	debug(e.target, sel.anchorNode.nodeName, sel.focusNode.nodeName, rng.startContainer, rng.endContainer, rng.commonAncestorContainer, sel.anchorOffset, sel.focusOffset, rng.toString());

		// Setup before range
		rngBefore = doc.createRange();
		rngBefore.setStart(sel.anchorNode, sel.anchorOffset);
		rngBefore.collapse(true);

		// Setup after range
		rngAfter = doc.createRange();
		rngAfter.setStart(sel.focusNode, sel.focusOffset);
		rngAfter.collapse(true);

		// Setup start/end points
		direct = rngBefore.compareBoundaryPoints(rngBefore.START_TO_END, rngAfter) < 0;
		startNode = direct ? sel.anchorNode : sel.focusNode;
		startOffset = direct ? sel.anchorOffset : sel.focusOffset;
		endNode = direct ? sel.focusNode : sel.anchorNode;
		endOffset = direct ? sel.focusOffset : sel.anchorOffset;

		startNode = startNode.nodeName == "BODY" ? startNode.firstChild : startNode;
		endNode = endNode.nodeName == "BODY" ? endNode.firstChild : endNode;

		// Get block elements
		startBlock = inst.getParentBlockElement(startNode);
		endBlock = inst.getParentBlockElement(endNode);

		// If absolute force paragraph generation within
		if (startBlock && new RegExp('absolute|relative|static', 'gi').test(startBlock.style.position))
			startBlock = null;

		if (endBlock && new RegExp('absolute|relative|static', 'gi').test(endBlock.style.position))
			endBlock = null;

		// Use current block name
		if (startBlock != null) {
			blockName = startBlock.nodeName;

			// Use P instead
			if (blockName == "TD" || blockName == "TABLE" || (blockName == "DIV" && new RegExp('left|right', 'gi').test(startBlock.style.cssFloat)))
				blockName = "P";
		}

		// Within a list use normal behaviour
		if (tinyMCE.getParentElement(startBlock, "OL,UL", null, body) != null)
			return false;

		// Within a table create new paragraphs
		if ((startBlock != null && startBlock.nodeName == "TABLE") || (endBlock != null && endBlock.nodeName == "TABLE"))
			startBlock = endBlock = null;

		// Setup new paragraphs
		paraBefore = (startBlock != null && startBlock.nodeName == blockName) ? startBlock.cloneNode(false) : doc.createElement(blockName);
		paraAfter = (endBlock != null && endBlock.nodeName == blockName) ? endBlock.cloneNode(false) : doc.createElement(blockName);

		// Is header, then force paragraph under
		if (/^(H[1-6])$/.test(blockName))
			paraAfter = doc.createElement("p");

		// Setup chop nodes
		startChop = startNode;
		endChop = endNode;

		// Get startChop node
		node = startChop;
		do {
			if (node == body || node.nodeType == 9 || tinyMCE.isBlockElement(node))
				break;

			startChop = node;
		} while ((node = node.previousSibling ? node.previousSibling : node.parentNode));

		// Get endChop node
		node = endChop;
		do {
			if (node == body || node.nodeType == 9 || tinyMCE.isBlockElement(node))
				break;

			endChop = node;
		} while ((node = node.nextSibling ? node.nextSibling : node.parentNode));

		// Fix when only a image is within the TD
		if (startChop.nodeName == "TD")
			startChop = startChop.firstChild;

		if (endChop.nodeName == "TD")
			endChop = endChop.lastChild;

		// If not in a block element
		if (startBlock === null) {
			// Delete selection
			rng.deleteContents();

			if (!tinyMCE.isSafari)
				sel.removeAllRanges();

			if (startChop != rootElm && endChop != rootElm) {
				// Insert paragraph before
				rngBefore = rng.cloneRange();

				if (startChop == body)
					rngBefore.setStart(startChop, 0);
				else
					rngBefore.setStartBefore(startChop);

				paraBefore.appendChild(rngBefore.cloneContents());

				// Insert paragraph after
				if (endChop.parentNode.nodeName == blockName)
					endChop = endChop.parentNode;

				// If not after image
				//if (rng.startContainer.nodeName != "BODY" && rng.endContainer.nodeName != "BODY")
					rng.setEndAfter(endChop);

				if (endChop.nodeName != "#text" && endChop.nodeName != "BODY")
					rngBefore.setEndAfter(endChop);

				contents = rng.cloneContents();
				if (contents.firstChild && (contents.firstChild.nodeName == blockName || contents.firstChild.nodeName == "BODY"))
					paraAfter.innerHTML = contents.firstChild.innerHTML;
				else
					paraAfter.appendChild(contents);

				// Check if it's a empty paragraph
				if (isEmpty(paraBefore))
					paraBefore.innerHTML = "&nbsp;";

				// Check if it's a empty paragraph
				if (isEmpty(paraAfter))
					paraAfter.innerHTML = "&nbsp;";

				// Delete old contents
				rng.deleteContents();
				rngAfter.deleteContents();
				rngBefore.deleteContents();

				// Insert new paragraphs
				if (tinyMCE.isOpera) {
					paraBefore.normalize();
					rngBefore.insertNode(paraBefore);
					paraAfter.normalize();
					rngBefore.insertNode(paraAfter);
				} else {
					paraAfter.normalize();
					rngBefore.insertNode(paraAfter);
					paraBefore.normalize();
					rngBefore.insertNode(paraBefore);
				}

				//tinyMCE.debug("1: ", paraBefore.innerHTML, paraAfter.innerHTML);
			} else {
				body.innerHTML = "<" + blockName + ">&nbsp;</" + blockName + "><" + blockName + ">&nbsp;</" + blockName + ">";
				paraAfter = body.childNodes[1];
			}

			inst.selection.moveToBookmark(b);
			inst.selection.selectNode(paraAfter, true, true);

			return true;
		}

		// Place first part within new paragraph
		if (startChop.nodeName == blockName)
			rngBefore.setStart(startChop, 0);
		else
			rngBefore.setStartBefore(startChop);

		rngBefore.setEnd(startNode, startOffset);
		paraBefore.appendChild(rngBefore.cloneContents());

		// Place secound part within new paragraph
		rngAfter.setEndAfter(endChop);
		rngAfter.setStart(endNode, endOffset);
		contents = rngAfter.cloneContents();

		if (contents.firstChild && contents.firstChild.nodeName == blockName) {
	/*		var nodes = contents.firstChild.childNodes;
			for (i=0; i<nodes.length; i++) {
				//tinyMCE.debug(nodes[i].nodeName);
				if (nodes[i].nodeName != "BODY")
					paraAfter.appendChild(nodes[i]);
			}
	*/
			paraAfter.innerHTML = contents.firstChild.innerHTML;
		} else
			paraAfter.appendChild(contents);

		// Check if it's a empty paragraph
		if (isEmpty(paraBefore))
			paraBefore.innerHTML = "&nbsp;";

		// Check if it's a empty paragraph
		if (isEmpty(paraAfter))
			paraAfter.innerHTML = "&nbsp;";

		// Create a range around everything
		rng = doc.createRange();

		if (!startChop.previousSibling && startChop.parentNode.nodeName.toUpperCase() == blockName) {
			rng.setStartBefore(startChop.parentNode);
		} else {
			if (rngBefore.startContainer.nodeName.toUpperCase() == blockName && rngBefore.startOffset === 0)
				rng.setStartBefore(rngBefore.startContainer);
			else
				rng.setStart(rngBefore.startContainer, rngBefore.startOffset);
		}

		if (!endChop.nextSibling && endChop.parentNode.nodeName.toUpperCase() == blockName)
			rng.setEndAfter(endChop.parentNode);
		else
			rng.setEnd(rngAfter.endContainer, rngAfter.endOffset);

		// Delete all contents and insert new paragraphs
		rng.deleteContents();

		if (tinyMCE.isOpera) {
			rng.insertNode(paraBefore);
			rng.insertNode(paraAfter);
		} else {
			rng.insertNode(paraAfter);
			rng.insertNode(paraBefore);
		}

		//tinyMCE.debug("2", paraBefore.innerHTML, paraAfter.innerHTML);

		// Normalize
		paraAfter.normalize();
		paraBefore.normalize();

		inst.selection.moveToBookmark(b);
		inst.selection.selectNode(paraAfter, true, true);

		return true;
	},

	/**
	 * Handles the backspace action in Gecko. This will remove the weird BR element
	 * that gets generated when a user hits backspace in the beginning of a paragraph.
	 *
	 * @param {TinyMCE_Control} inst TinyMCE editor control instance.
	 * @return true/false if the event should be canceled or not.
	 * @type bool
	 */
	_handleBackSpace : function(inst) {
		var r = inst.getRng(), sn = r.startContainer, nv, s = false;

		// Added body check for bug #1527787
		if (sn && sn.nextSibling && sn.nextSibling.nodeName == "BR" && sn.parentNode.nodeName != "BODY") {
			nv = sn.nodeValue;

			// Handle if a backspace is pressed after a space character #bug 1466054 removed since fix for #1527787
			/*if (nv != null && nv.length >= r.startOffset && nv.charAt(r.startOffset - 1) == ' ')
				s = true;*/

			// Only remove BRs if we are at the end of line #bug 1464152
			if (nv != null && r.startOffset == nv.length)
				sn.nextSibling.parentNode.removeChild(sn.nextSibling);
		}

		if (inst.settings.auto_resize)
			inst.resizeToContent();

		return s;
	}

	/**#@-*/
};
