/**
 * ControlSelection.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles control selection of elements. Controls are elements
 * that can be resized and needs to be selected as a whole. It adds custom resize handles
 * to all browser engines that support properly disabling the built in resize logic.
 *
 * @class tinymce.dom.ControlSelection
 */
define("tinymce/dom/ControlSelection", [
	"tinymce/util/VK",
	"tinymce/util/Tools",
	"tinymce/Env"
], function(VK, Tools, Env) {
	return function(selection, editor) {
		var dom = editor.dom, each = Tools.each;
		var selectedElm, selectedElmGhost, resizeHandles, selectedHandle, lastMouseDownEvent;
		var startX, startY, selectedElmX, selectedElmY, startW, startH, ratio, resizeStarted;
		var width, height, editableDoc = editor.getDoc(), rootDocument = document, isIE = Env.ie && Env.ie < 11;

		// Details about each resize handle how to scale etc
		resizeHandles = {
			// Name: x multiplier, y multiplier, delta size x, delta size y
			n:  [0.5,   0,     0,   -1],
			e:  [1,    0.5,    1,    0],
			s:  [0.5,   1,     0,    1],
			w:  [0,    0.5,   -1,    0],
			nw: [0,     0,    -1,   -1],
			ne: [1,     0,     1,   -1],
			se: [1,     1,     1,    1],
			sw: [0,     1,    -1,    1]
		};

		// Add CSS for resize handles, cloned element and selected
		var rootClass = '.mce-content-body';
		editor.contentStyles.push(
			rootClass + ' div.mce-resizehandle {' +
				'position: absolute;' +
				'border: 1px solid black;' +
				'background: #FFF;' +
				'width: 5px;' +
				'height: 5px;' +
				'z-index: 10000' +
			'}' +
			rootClass + ' .mce-resizehandle:hover {' +
				'background: #000' +
			'}' +
			rootClass + ' img[data-mce-selected], hr[data-mce-selected] {' +
				'outline: 1px solid black;' +
				'resize: none' + // Have been talks about implementing this in browsers
			'}' +
			rootClass + ' .mce-clonedresizable {' +
				'position: absolute;' +
				(Env.gecko ? '' : 'outline: 1px dashed black;') + // Gecko produces trails while resizing
				'opacity: .5;' +
				'filter: alpha(opacity=50);' +
				'z-index: 10000' +
			'}'
		);

		function isResizable(elm) {
			var selector = editor.settings.object_resizing;

			if (selector === false || Env.iOS) {
				return false;
			}

			if (typeof selector != 'string') {
				selector = 'table,img,div';
			}

			if (elm.getAttribute('data-mce-resize') === 'false') {
				return false;
			}

			return editor.dom.is(elm, selector);
		}

		function resizeGhostElement(e) {
			var deltaX, deltaY;

			// Calc new width/height
			deltaX = e.screenX - startX;
			deltaY = e.screenY - startY;

			// Calc new size
			width = deltaX * selectedHandle[2] + startW;
			height = deltaY * selectedHandle[3] + startH;

			// Never scale down lower than 5 pixels
			width = width < 5 ? 5 : width;
			height = height < 5 ? 5 : height;

			// Constrain proportions when modifier key is pressed or if the nw, ne, sw, se corners are moved on an image
			if (VK.modifierPressed(e) || (selectedElm.nodeName == "IMG" && selectedHandle[2] * selectedHandle[3] !== 0)) {
				width = Math.round(height / ratio);
				height = Math.round(width * ratio);
			}

			// Update ghost size
			dom.setStyles(selectedElmGhost, {
				width: width,
				height: height
			});

			// Update ghost X position if needed
			if (selectedHandle[2] < 0 && selectedElmGhost.clientWidth <= width) {
				dom.setStyle(selectedElmGhost, 'left', selectedElmX + (startW - width));
			}

			// Update ghost Y position if needed
			if (selectedHandle[3] < 0 && selectedElmGhost.clientHeight <= height) {
				dom.setStyle(selectedElmGhost, 'top', selectedElmY + (startH - height));
			}

			if (!resizeStarted) {
				editor.fire('ObjectResizeStart', {target: selectedElm, width: startW, height: startH});
				resizeStarted = true;
			}
		}

		function endGhostResize() {
			resizeStarted = false;

			function setSizeProp(name, value) {
				if (value) {
					// Resize by using style or attribute
					if (selectedElm.style[name] || !editor.schema.isValid(selectedElm.nodeName.toLowerCase(), name)) {
						dom.setStyle(selectedElm, name, value);
					} else {
						dom.setAttrib(selectedElm, name, value);
					}
				}
			}

			// Set width/height properties
			setSizeProp('width', width);
			setSizeProp('height', height);

			dom.unbind(editableDoc, 'mousemove', resizeGhostElement);
			dom.unbind(editableDoc, 'mouseup', endGhostResize);

			if (rootDocument != editableDoc) {
				dom.unbind(rootDocument, 'mousemove', resizeGhostElement);
				dom.unbind(rootDocument, 'mouseup', endGhostResize);
			}

			// Remove ghost and update resize handle positions
			dom.remove(selectedElmGhost);

			if (!isIE || selectedElm.nodeName == "TABLE") {
				showResizeRect(selectedElm);
			}

			editor.fire('ObjectResized', {target: selectedElm, width: width, height: height});
			editor.nodeChanged();
		}

		function showResizeRect(targetElm, mouseDownHandleName, mouseDownEvent) {
			var position, targetWidth, targetHeight, e, rect, offsetParent = editor.getBody();

			unbindResizeHandleEvents();

			// Get position and size of target
			position = dom.getPos(targetElm, offsetParent);
			selectedElmX = position.x;
			selectedElmY = position.y;
			rect = targetElm.getBoundingClientRect(); // Fix for Gecko offsetHeight for table with caption
			targetWidth = rect.width || (rect.right - rect.left);
			targetHeight = rect.height || (rect.bottom - rect.top);

			// Reset width/height if user selects a new image/table
			if (selectedElm != targetElm) {
				detachResizeStartListener();
				selectedElm = targetElm;
				width = height = 0;
			}

			// Makes it possible to disable resizing
			e = editor.fire('ObjectSelected', {target: targetElm});

			if (isResizable(targetElm) && !e.isDefaultPrevented()) {
				each(resizeHandles, function(handle, name) {
					var handleElm, handlerContainerElm;

					function startDrag(e) {
						startX = e.screenX;
						startY = e.screenY;
						startW = selectedElm.clientWidth;
						startH = selectedElm.clientHeight;
						ratio = startH / startW;
						selectedHandle = handle;

						selectedElmGhost = selectedElm.cloneNode(true);
						dom.addClass(selectedElmGhost, 'mce-clonedresizable');
						selectedElmGhost.contentEditable = false; // Hides IE move layer cursor
						selectedElmGhost.unSelectabe = true;
						dom.setStyles(selectedElmGhost, {
							left: selectedElmX,
							top: selectedElmY,
							margin: 0
						});

						selectedElmGhost.removeAttribute('data-mce-selected');
						editor.getBody().appendChild(selectedElmGhost);

						dom.bind(editableDoc, 'mousemove', resizeGhostElement);
						dom.bind(editableDoc, 'mouseup', endGhostResize);

						if (rootDocument != editableDoc) {
							dom.bind(rootDocument, 'mousemove', resizeGhostElement);
							dom.bind(rootDocument, 'mouseup', endGhostResize);
						}
					}

					if (mouseDownHandleName) {
						// Drag started by IE native resizestart
						if (name == mouseDownHandleName) {
							startDrag(mouseDownEvent);
						}

						return;
					}

					// Get existing or render resize handle
					handleElm = dom.get('mceResizeHandle' + name);
					if (!handleElm) {
						handlerContainerElm = editor.getBody();

						handleElm = dom.add(handlerContainerElm, 'div', {
							id: 'mceResizeHandle' + name,
							'data-mce-bogus': true,
							'class': 'mce-resizehandle',
							unselectable: true,
							style: 'cursor:' + name + '-resize; margin:0; padding:0'
						});

						// Hides IE move layer cursor
						// If we set it on Chrome we get this wounderful bug: #6725
						if (Env.ie) {
							handleElm.contentEditable = false;
						}
					} else {
						dom.show(handleElm);
					}

					if (!handle.elm) {
						dom.bind(handleElm, 'mousedown', function(e) {
							e.stopImmediatePropagation();
							e.preventDefault();
							startDrag(e);
						});

						handle.elm = handleElm;
					}

					/*
					var halfHandleW = handleElm.offsetWidth / 2;
					var halfHandleH = handleElm.offsetHeight / 2;

					// Position element
					dom.setStyles(handleElm, {
						left: Math.floor((targetWidth * handle[0] + selectedElmX) - halfHandleW + (handle[2] * halfHandleW)),
						top: Math.floor((targetHeight * handle[1] + selectedElmY) - halfHandleH + (handle[3] * halfHandleH))
					});
					*/

					// Position element
					dom.setStyles(handleElm, {
						left: (targetWidth * handle[0] + selectedElmX) - (handleElm.offsetWidth / 2),
						top: (targetHeight * handle[1] + selectedElmY) - (handleElm.offsetHeight / 2)
					});
				});
			} else {
				hideResizeRect();
			}

			selectedElm.setAttribute('data-mce-selected', '1');
		}

		function hideResizeRect() {
			var name, handleElm;

			unbindResizeHandleEvents();

			if (selectedElm) {
				selectedElm.removeAttribute('data-mce-selected');
			}

			for (name in resizeHandles) {
				handleElm = dom.get('mceResizeHandle' + name);
				if (handleElm) {
					dom.unbind(handleElm);
					dom.remove(handleElm);
				}
			}
		}

		function updateResizeRect(e) {
			var controlElm;

			function isChildOrEqual(node, parent) {
				if (node) {
					do {
						if (node === parent) {
							return true;
						}
					} while ((node = node.parentNode));
				}
			}

			// Remove data-mce-selected from all elements since they might have been copied using Ctrl+c/v
			each(dom.select('img[data-mce-selected],hr[data-mce-selected]'), function(img) {
				img.removeAttribute('data-mce-selected');
			});

			controlElm = e.type == 'mousedown' ? e.target : selection.getNode();
			controlElm = dom.getParent(controlElm, isIE ? 'table' : 'table,img,hr');

			if (isChildOrEqual(controlElm, editor.getBody())) {
				disableGeckoResize();

				if (isChildOrEqual(selection.getStart(), controlElm) && isChildOrEqual(selection.getEnd(), controlElm)) {
					if (!isIE || (controlElm != selection.getStart() && selection.getStart().nodeName !== 'IMG')) {
						showResizeRect(controlElm);
						return;
					}
				}
			}

			hideResizeRect();
		}

		function attachEvent(elm, name, func) {
			if (elm && elm.attachEvent) {
				elm.attachEvent('on' + name, func);
			}
		}

		function detachEvent(elm, name, func) {
			if (elm && elm.detachEvent) {
				elm.detachEvent('on' + name, func);
			}
		}

		function resizeNativeStart(e) {
			var target = e.srcElement, pos, name, corner, cornerX, cornerY, relativeX, relativeY;

			pos = target.getBoundingClientRect();
			relativeX = lastMouseDownEvent.clientX - pos.left;
			relativeY = lastMouseDownEvent.clientY - pos.top;

			// Figure out what corner we are draging on
			for (name in resizeHandles) {
				corner = resizeHandles[name];

				cornerX = target.offsetWidth * corner[0];
				cornerY = target.offsetHeight * corner[1];

				if (Math.abs(cornerX - relativeX) < 8 && Math.abs(cornerY - relativeY) < 8) {
					selectedHandle = corner;
					break;
				}
			}

			// Remove native selection and let the magic begin
			resizeStarted = true;
			editor.getDoc().selection.empty();
			showResizeRect(target, name, lastMouseDownEvent);
		}

		function nativeControlSelect(e) {
			var target = e.srcElement;

			if (target != selectedElm) {
				detachResizeStartListener();

				if (target.id.indexOf('mceResizeHandle') === 0) {
					e.returnValue = false;
					return;
				}

				if (target.nodeName == 'IMG' || target.nodeName == 'TABLE') {
					hideResizeRect();
					selectedElm = target;
					attachEvent(target, 'resizestart', resizeNativeStart);
				}
			}
		}

		function detachResizeStartListener() {
			detachEvent(selectedElm, 'resizestart', resizeNativeStart);
		}

		function unbindResizeHandleEvents() {
			for (var name in resizeHandles) {
				var handle = resizeHandles[name];

				if (handle.elm) {
					dom.unbind(handle.elm);
					delete handle.elm;
				}
			}
		}

		function disableGeckoResize() {
			try {
				// Disable object resizing on Gecko
				editor.getDoc().execCommand('enableObjectResizing', false, false);
			} catch (ex) {
				// Ignore
			}
		}

		function controlSelect(elm) {
			var ctrlRng;

			if (!isIE) {
				return;
			}

			ctrlRng = editableDoc.body.createControlRange();

			try {
				ctrlRng.addElement(elm);
				ctrlRng.select();
				return true;
			} catch (ex) {
				// Ignore since the element can't be control selected for example a P tag
			}
		}

		editor.on('init', function() {
			if (isIE) {
				// Hide the resize rect on resize and reselect the image
				editor.on('ObjectResized', function(e) {
					if (e.target.nodeName != 'TABLE') {
						hideResizeRect();
						controlSelect(e.target);
					}
				});

				attachEvent(editor.getBody(), 'controlselect', nativeControlSelect);

				editor.on('mousedown', function(e) {
					lastMouseDownEvent = e;
				});
			} else {
				disableGeckoResize();

				if (Env.ie >= 11) {
					// TODO: Drag/drop doesn't work
					editor.on('mouseup', function(e) {
						var nodeName = e.target.nodeName;

						if (/^(TABLE|IMG|HR)$/.test(nodeName)) {
							editor.selection.select(e.target, nodeName == 'TABLE');
							editor.nodeChanged();
						}
					});

					editor.dom.bind(editor.getBody(), 'mscontrolselect', function(e) {
						if (/^(TABLE|IMG|HR)$/.test(e.target.nodeName)) {
							e.preventDefault();

							// This moves the selection from being a control selection to a text like selection like in WebKit #6753
							// TODO: Fix this the day IE works like other browsers without this nasty native ugly control selections.
							if (e.target.tagName == 'IMG') {
								window.setTimeout(function() {
									editor.selection.select(e.target);
								}, 0);
							}
						}
					});
				}
			}

			editor.on('nodechange mousedown mouseup ResizeEditor', updateResizeRect);

			// Update resize rect while typing in a table
			editor.on('keydown keyup', function(e) {
				if (selectedElm && selectedElm.nodeName == "TABLE") {
					updateResizeRect(e);
				}
			});

			editor.on('hide', hideResizeRect);

			// Hide rect on focusout since it would float on top of windows otherwise
			//editor.on('focusout', hideResizeRect);
		});

		editor.on('remove', unbindResizeHandleEvents);

		function destroy() {
			selectedElm = selectedElmGhost = null;

			if (isIE) {
				detachResizeStartListener();
				detachEvent(editor.getBody(), 'controlselect', nativeControlSelect);
			}
		}

		return {
			isResizable: isResizable,
			showResizeRect: showResizeRect,
			hideResizeRect: hideResizeRect,
			updateResizeRect: updateResizeRect,
			controlSelect: controlSelect,
			destroy: destroy
		};
	};
});
